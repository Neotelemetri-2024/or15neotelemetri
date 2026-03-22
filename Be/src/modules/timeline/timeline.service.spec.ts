import { Test, TestingModule } from '@nestjs/testing';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../../common/services/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TimelineService', () => {
  let service: TimelineService;
  let prisma: PrismaService;

  const mockTimeline = {
    id: '1',
    title: 'Test Event',
    description: 'Test Desc',
    startAt: new Date(),
    endAt: new Date(),
    orderIndex: 1,
  };

  const mockPrismaService = {
    recruitmentTimeline: {
      findMany: jest.fn().mockResolvedValue([mockTimeline]),
      findUnique: jest.fn().mockResolvedValue(mockTimeline),
      create: jest.fn().mockResolvedValue(mockTimeline),
      update: jest.fn().mockResolvedValue(mockTimeline),
      delete: jest.fn().mockResolvedValue(mockTimeline),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all timelines', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockTimeline]);
      expect(prisma.recruitmentTimeline.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a timeline if found', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockTimeline);
    });

    it('should throw NotFoundException if not found', async () => {
      jest
        .spyOn(prisma.recruitmentTimeline, 'findUnique')
        .mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new timeline', async () => {
      const dto = {
        title: 'New',
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        orderIndex: 2,
      };
      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(prisma.recruitmentTimeline.create).toHaveBeenCalled();
    });
  });
});
