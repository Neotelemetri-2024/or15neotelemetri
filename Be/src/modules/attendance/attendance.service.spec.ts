import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../common/services/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: PrismaService;

  const mockTimeline = {
    id: 'timeline-1',
    title: 'Test Event',
    attendancePasscode: 'PASS123',
    startAt: new Date(Date.now() - 3600000),
    endAt: new Date(Date.now() + 3600000),
  };

  const mockPrismaService = {
    recruitmentTimeline: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    submissionVerification: {
      findFirst: jest.fn(),
    },
    attendance: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIn', () => {
    const userId = 'user-1';
    const dto = { timelineId: 'timeline-1', passcode: 'PASS123' };

    it('should throw NotFound if timeline does not exist', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue(null);
      await expect(service.checkIn(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequest if passcode is not set', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue({
        ...mockTimeline,
        attendancePasscode: null,
      });
      await expect(service.checkIn(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if passcode is incorrect', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue(
        mockTimeline,
      );
      await expect(
        service.checkIn(userId, { ...dto, passcode: 'WRONG' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequest if out of time window', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue({
        ...mockTimeline,
        startAt: new Date(Date.now() + 3600000), // In the future
      });
      await expect(service.checkIn(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if user is not verified', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue(
        mockTimeline,
      );
      mockPrismaService.submissionVerification.findFirst.mockResolvedValue(
        null,
      );
      await expect(service.checkIn(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should perform upsert if all conditions met', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue(
        mockTimeline,
      );
      mockPrismaService.submissionVerification.findFirst.mockResolvedValue({
        status: 'APPROVED',
      });
      mockPrismaService.attendance.upsert.mockResolvedValue({ id: 'att-1' });

      const result = await service.checkIn(userId, dto);
      expect(result).toBeDefined();
      expect(prisma.attendance.upsert).toHaveBeenCalled();
    });
  });

  describe('setPasscode', () => {
    it('should update the passcode', async () => {
      mockPrismaService.recruitmentTimeline.findUnique.mockResolvedValue(
        mockTimeline,
      );
      mockPrismaService.recruitmentTimeline.update.mockResolvedValue({
        ...mockTimeline,
        attendancePasscode: 'NEWPASS',
      });

      const result = await service.setPasscode('timeline-1', 'NEWPASS');
      expect(result.attendancePasscode).toBe('NEWPASS');
      expect(prisma.recruitmentTimeline.update).toHaveBeenCalledWith({
        where: { id: 'timeline-1' },
        data: { attendancePasscode: 'NEWPASS' },
      });
    });
  });
});
