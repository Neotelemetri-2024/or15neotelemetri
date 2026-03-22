/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';
import {
  UserRole,
  VerificationStatus,
} from '../prisma/generated-client/client';

describe('Attendance (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;
  let timelineId: string;
  let userId: string;
  const userEmail = `user-att-${Date.now()}@test.com`;
  const adminEmail = `admin-att-${Date.now()}@test.com`;
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
        fullName: 'Att User',
        nim: `NIM-ATT-${Date.now()}`,
      });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not created');
    userId = user.id;

    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userEmail, password });

    userToken = userLogin.body.access_token as string;

    // Create and Login Admin
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password,
        fullName: 'Admin Att',
        nim: `NIM-ADM-${Date.now()}`,
      });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: UserRole.ADMIN },
    });
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password });

    adminToken = adminLogin.body.access_token as string;

    // Approve user verification
    await prisma.submissionVerification.create({
      data: {
        userId: user.id,
        status: VerificationStatus.APPROVED,
        twibbonLink: 'http://twibbon.url',
      },
    });

    // Create timeline
    const timeline = await prisma.recruitmentTimeline.create({
      data: {
        title: 'Attendance Event',
        startAt: new Date(Date.now() - 3600000),
        endAt: new Date(Date.now() + 3600000),
        orderIndex: 1,
        attendancePasscode: 'SECRET123',
      },
    });
    timelineId = timeline.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, adminEmail] } },
    });
    if (timelineId) {
      await prisma.recruitmentTimeline
        .delete({ where: { id: timelineId } })
        .catch(() => {});
    }
    await prisma.$disconnect();
    await app.close();
  });

  describe('Attendance Controller', () => {
    it('/api/attendance/check-in (POST) - Success', async () => {
      await request(app.getHttpServer())
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          timelineId,
          passcode: 'SECRET123',
        })
        .expect(201);

      const attendance = await prisma.attendance.findFirst({
        where: { userId, timelineId },
      });
      expect(attendance?.status).toBe('PRESENT');
    });

    it('/api/attendance/timeline/:timelineId (GET) - Admin access', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/attendance/timeline/${timelineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const userAtt = response.body.find((u: any) => u.userId === userId);

      expect(userAtt.status).toBe('PRESENT');
    });

    it('/api/attendance/me (GET) - User access', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/attendance/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);

      expect(response.body[0].timeline.title).toBe('Attendance Event');
    });
  });
});
