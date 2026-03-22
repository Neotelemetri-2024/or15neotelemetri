import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CloudinaryStorageService } from '../../common/services/storage/cloudinary-storage.service';
import { ForbiddenException } from '@nestjs/common';
import { AttemptStatus } from '../../../prisma/generated-client/client';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let prisma: PrismaService;
  let storage: CloudinaryStorageService;

  const mockPrismaService = {
    assignment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    profile: { findUnique: jest.fn() },
    examAttempt: { findFirst: jest.fn() },
    assignmentSubmission: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockStorage = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
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

    service = module.get<AssignmentService>(AssignmentService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<CloudinaryStorageService>(CloudinaryStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      title: 'JS Task',
      description: 'JS Description',
      dueAt: new Date().toISOString(),
      subDivisionId: 'sub-1',
    };
    const adminId = 'admin-1';

    it('should create an assignment without file', async () => {
      mockPrismaService.assignment.create.mockResolvedValue({
        id: 'asg-1',
        ...dto,
        fileUrl: null,
        createdByAdminId: adminId,
      });

      const result = await service.create(dto, adminId);
      expect(result.id).toBe('asg-1');
      expect(result.fileUrl).toBeNull();
      expect(prisma.assignment.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          subDivisionId: dto.subDivisionId,
          fileUrl: null,
          dueAt: new Date(dto.dueAt),
          createdByAdminId: adminId,
        },
      });
      expect(storage.uploadFile).not.toHaveBeenCalled();
    });

    it('should create an assignment with file upload', async () => {
      const file = { originalname: 'task.pdf' } as any;
      mockStorage.uploadFile.mockResolvedValue('http://cloudinary.com/task.pdf');
      mockPrismaService.assignment.create.mockResolvedValue({
        id: 'asg-1',
        ...dto,
        fileUrl: 'http://cloudinary.com/task.pdf',
        createdByAdminId: adminId,
      });

      const result = await service.create(dto, adminId, file);
      expect(result.id).toBe('asg-1');
      expect(result.fileUrl).toBe('http://cloudinary.com/task.pdf');
      expect(storage.uploadFile).toHaveBeenCalledWith(file, 'assignment-tasks');
      expect(prisma.assignment.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const asgId = 'asg-1';
    const dto = {
      title: 'Updated Task',
      subDivisionId: 'sub-1',
    };

    it('should update assignment and keep existing fileUrl if no new file', async () => {
      mockPrismaService.assignment.findUnique.mockResolvedValue({
        id: asgId,
        fileUrl: 'old-url',
      });
      mockPrismaService.assignment.update.mockResolvedValue({
        id: asgId,
        ...dto,
        fileUrl: 'old-url',
      });

      const result = await service.update(asgId, dto);
      expect(result.fileUrl).toBe('old-url');
      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: { id: asgId },
        data: expect.objectContaining({ fileUrl: 'old-url' }),
      });
      expect(storage.uploadFile).not.toHaveBeenCalled();
    });

    it('should update assignment and upload new file if provided', async () => {
      const file = { originalname: 'new-task.pdf' } as any;
      mockPrismaService.assignment.findUnique.mockResolvedValue({
        id: asgId,
        fileUrl: 'old-url',
      });
      mockStorage.uploadFile.mockResolvedValue('new-url');
      mockPrismaService.assignment.update.mockResolvedValue({
        id: asgId,
        ...dto,
        fileUrl: 'new-url',
      });

      const result = await service.update(asgId, dto, file);
      expect(result.fileUrl).toBe('new-url');
      expect(storage.uploadFile).toHaveBeenCalledWith(file, 'assignment-tasks');
      expect(prisma.assignment.update).toHaveBeenCalledWith({
        where: { id: asgId },
        data: expect.objectContaining({ fileUrl: 'new-url' }),
      });
    });
  });

  describe('submit', () => {
    const userId = 'user-1';
    const asgId = 'asg-1';
    const file = { originalname: 'task.zip' } as any;

    it('should throw Forbidden if exam not submitted', async () => {
      mockPrismaService.examAttempt.findFirst.mockResolvedValue(null);
      await expect(service.submit(asgId, userId, file)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create submission if none exists', async () => {
      mockPrismaService.examAttempt.findFirst.mockResolvedValue({
        status: AttemptStatus.SUBMITTED,
      });
      mockPrismaService.assignment.findUnique.mockResolvedValue({ id: asgId });
      mockPrismaService.assignmentSubmission.findFirst.mockResolvedValue(null);
      mockStorage.uploadFile.mockResolvedValue('url-zip');
      mockPrismaService.assignmentSubmission.create.mockResolvedValue({
        id: 'subm-1',
      });

      const result = await service.submit(asgId, userId, file);
      expect(result.id).toBe('subm-1');
      expect(prisma.assignmentSubmission.create).toHaveBeenCalled();
    });

    it('should update existing submission', async () => {
      mockPrismaService.examAttempt.findFirst.mockResolvedValue({
        status: AttemptStatus.SUBMITTED,
      });
      mockPrismaService.assignment.findUnique.mockResolvedValue({ id: asgId });
      mockPrismaService.assignmentSubmission.findFirst.mockResolvedValue({
        id: 'subm-1',
      });
      mockStorage.uploadFile.mockResolvedValue('new-url');
      mockPrismaService.assignmentSubmission.update.mockResolvedValue({
        id: 'subm-1',
      });

      await service.submit(asgId, userId, file);
      expect(prisma.assignmentSubmission.update).toHaveBeenCalled();
    });
  });

  describe('scoreSubmission', () => {
    it('should update score and feedback', async () => {
      mockPrismaService.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'subm-1',
      });
      mockPrismaService.assignmentSubmission.update.mockResolvedValue({
        id: 'subm-1',
        score: 90,
      });

      const result = await service.scoreSubmission('subm-1', {
        score: 90,
        feedback: 'Good',
      });
      expect(result.score).toBe(90);
    });
  });
});
