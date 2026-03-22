import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../common/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '../../../prisma/generated-client/client';

// Mock midtrans-client
jest.mock('midtrans-client', () => ({
  Snap: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn().mockResolvedValue({
      token: 'mock-token',
      redirect_url: 'http://mock-redirect.url',
    }),
  })),
}));

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'MIDTRANS_SERVER_KEY') return 'mock-server-key';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should throw BadRequest if user has no profile', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.createTransaction('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if verification is not approved', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        profile: { fullName: 'Test' },
        submissionVerifications: [{ status: 'PENDING' }],
      });
      await expect(service.createTransaction('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a transaction if all requirements met', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        profile: { fullName: 'Test', whatsappNumber: '0812' },
        submissionVerifications: [{ status: 'APPROVED' }],
      });
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.create.mockResolvedValue({
        paymentUrl: 'http://mock-redirect.url',
        status: PaymentStatus.PENDING,
        amount: 50000,
      });

      const result = await service.createTransaction('user-1');
      expect(result.paymentUrl).toBe('http://mock-redirect.url');
      expect(prisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('should update status to PAID on settlement', async () => {
      const orderId = 'ORDER-1';
      const statusCode = '200';
      const grossAmount = '50000.00';
      const serverKey = 'mock-server-key';
      
      const crypto = require('crypto');
      const signatureKey = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      const payload: any = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: signatureKey,
      };

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        status: 'PENDING',
      });

      await service.handleWebhook(payload);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({ status: PaymentStatus.PAID }),
      });
    });
  });
});
