/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { LearningModuleService } from './learning-module.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CloudinaryStorageService } from '../../common/services/storage/cloudinary-storage.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttemptStatus } from '../../../prisma/generated-client/client';

describe('LearningModuleService', () => {
  let service: LearningModuleService;
  let prisma: PrismaService;
  let storage: CloudinaryStorageService;

  const mockPrismaService = {
    learningModule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    profile: { findUnique: jest.fn() },
    examAttempt: { findFirst: jest.fn() },
  };

  const mockStorage = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningModuleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CloudinaryStorageService,
          useValue: mockStorage,
        },
      ],
    }).compile();

    service = module.get<LearningModuleService>(LearningModuleService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<CloudinaryStorageService>(CloudinaryStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should upload file and create module', async () => {
      const dto = { title: 'JS Basics', subDivisionId: 'sub-1', file: undefined };
      const file = { originalname: 'test.pdf' } as any;
      mockStorage.uploadFile.mockResolvedValue('http://cloud.com/test.pdf');
      mockPrismaService.learningModule.create.mockResolvedValue({
        id: 'mod-1',
        ...dto,
      });

      const result = await service.create(dto, 'admin-1', file);
      expect(result.id).toBe('mod-1');
      expect(mockStorage.uploadFile).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should throw Forbidden if exam not submitted', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        subDivisionId: 'sub-1',
      });
      mockPrismaService.examAttempt.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return modules if exam submitted', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        subDivisionId: 'sub-1',
      });
      mockPrismaService.examAttempt.findFirst.mockResolvedValue({
        id: 'attempt-1',
        status: AttemptStatus.SUBMITTED,
      });
      mockPrismaService.learningModule.findMany.mockResolvedValue([
        { id: 'mod-1' },
      ]);

      const result = await service.findByUserId('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFound if missing', async () => {
      mockPrismaService.learningModule.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
