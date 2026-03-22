/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';
import { VerificationStatus } from '../prisma/generated-client/client';

// Mock midtrans-client globally for E2E
jest.mock('midtrans-client', () => ({
  Snap: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn().mockResolvedValue({
      token: 'mock-e2e-token',
      redirect_url: 'http://mock-e2e-redirect.url',
    }),
  })),
}));

describe('Payment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: string;
  const userEmail = `user-pay-${Date.now()}@test.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('IStorageService')
      .useValue({ uploadFile: jest.fn().mockResolvedValue('http://mock.url') })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create and Login User
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: userEmail,
        password,
        fullName: 'Pay User',
        nim: `NIM-PAY-${Date.now()}`,
      });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not created');
    userId = user.id;

    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userEmail, password });

    userToken = userLogin.body.access_token as string;

    // Initially NOT approved - should fail payment creation
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: userEmail } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('Payment Controller', () => {
    it('/api/payments/create (POST) - Fail if not approved', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('/api/payments/create (POST) - Success after approval', async () => {
      // Approve user
      await prisma.submissionVerification.create({
        data: {
          userId,
          status: VerificationStatus.APPROVED,
          twibbonLink: 'http://twibbon.url',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body.paymentUrl).toBe('http://mock-e2e-redirect.url');
    });

    it('/api/payments/webhook (POST) - Should handle settlement', async () => {
      const payment = await prisma.payment.findFirst({ where: { userId } });
      if (!payment) throw new Error('Payment not found');

      const status_code = '200';
      const gross_amount = payment.amount.toString();
      const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
      
      const crypto = require('crypto');
      const signature_key = crypto
        .createHash('sha512')
        .update(`${payment.id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send({
          order_id: payment.id,
          transaction_status: 'settlement',
          fraud_status: 'accept',
          status_code,
          gross_amount,
          signature_key,
        })
        .expect(201);

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      expect(updatedPayment?.status).toBe('PAID');
    });
  });
});
