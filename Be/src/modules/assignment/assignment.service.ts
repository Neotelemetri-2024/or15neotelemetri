import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CloudinaryStorageService } from '../../common/services/storage/cloudinary-storage.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ScoreSubmissionDto } from './dto/score-submission.dto';
import { AttemptStatus } from '../../../prisma/generated-client/client';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: CloudinaryStorageService,
  ) {}

  // --- Assignment Management (Admin) ---

  async create(
    dto: CreateAssignmentDto,
    adminId: string,
    file?: Express.Multer.File,
  ) {
    let fileUrl: string | null = null;
    if (file) {
      fileUrl = await this.storage.uploadFile(file, 'assignment-tasks');
    }

    return this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        subDivisionId: dto.subDivisionId,
        fileUrl,
        dueAt: new Date(dto.dueAt),
        createdByAdminId: adminId,
      },
    });
  }

  async findAll() {
    return this.prisma.assignment.findMany({
      include: {
        subDivision: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile?.subDivisionId) return [];

    // Check if exam is submitted
    const examPassed = await this.prisma.examAttempt.findFirst({
      where: { userId, status: AttemptStatus.SUBMITTED },
    });

    if (!examPassed) {
      throw new ForbiddenException(
        'You must complete and submit your exam before accessing assignments.',
      );
    }

    return this.prisma.assignment.findMany({
      where: { subDivisionId: profile.subDivisionId },
      include: {
        submissions: {
          where: { userId },
          select: {
            id: true,
            submittedAt: true,
            score: true,
            feedback: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findBySubDivision(subDivisionId: string, userId: string) {
    return this.prisma.assignment.findMany({
      where: { subDivisionId },
      include: {
        submissions: {
          where: { userId },
          select: {
            id: true,
            submittedAt: true,
            score: true,
            feedback: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { subDivision: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, file?: Express.Multer.File) {
    const assignment = await this.findOne(id);

    let fileUrl = assignment.fileUrl;
    if (file) {
      fileUrl = await this.storage.uploadFile(file, 'assignment-tasks');
    }

    return this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        subDivisionId: dto.subDivisionId,
        fileUrl,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  // --- Submissions (User & Admin) ---

  async submit(
    assignmentId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const examPassed = await this.prisma.examAttempt.findFirst({
      where: { userId, status: AttemptStatus.SUBMITTED },
    });

    if (!examPassed) {
      throw new ForbiddenException(
        'You must complete and submit your exam before submitting assignments.',
      );
    }

    await this.findOne(assignmentId);

    // Check if duplicate submission, or just update? Let's say we update/resubmit.
    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId, userId },
    });

    const fileUrl = await this.storage.uploadFile(file, 'assignments');

    if (existing) {
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          submittedAt: new Date(),
        },
      });
    }

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        fileUrl,
        submittedAt: new Date(),
      },
    });
  }

  async getSubmissions(assignmentId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        user: {
          select: {
            profile: { select: { fullName: true, nim: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async scoreSubmission(submissionId: string, dto: ScoreSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
      },
    });
  }
}
