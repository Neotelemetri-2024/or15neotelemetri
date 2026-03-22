import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CloudinaryStorageService } from '../../common/services/storage/cloudinary-storage.service';
import { CreateLearningModuleDto } from './dto/create-learning-module.dto';
import { UpdateLearningModuleDto } from './dto/update-learning-module.dto';
import { AttemptStatus } from '../../../prisma/generated-client/client';

@Injectable()
export class LearningModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: CloudinaryStorageService,
  ) {}

  async create(
    dto: CreateLearningModuleDto,
    adminId: string,
    file: Express.Multer.File,
  ) {
    const fileUrl = await this.storage.uploadFile(file, 'learning-modules');

    return this.prisma.learningModule.create({
      data: {
        ...dto,
        fileUrl,
        createdByAdminId: adminId,
      },
    });
  }

  async findAll() {
    return this.prisma.learningModule.findMany({
      include: {
        subDivision: true,
        createdByAdmin: {
          select: { profile: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
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
        'You must complete and submit your exam before accessing learning modules.',
      );
    }

    return this.prisma.learningModule.findMany({
      where: { subDivisionId: profile.subDivisionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySubDivision(subDivisionId: string) {
    return this.prisma.learningModule.findMany({
      where: { subDivisionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.learningModule.findUnique({
      where: { id },
      include: { subDivision: true },
    });
    if (!module) throw new NotFoundException('Learning module not found');
    return module;
  }

  async update(
    id: string,
    dto: UpdateLearningModuleDto,
    file?: Express.Multer.File,
  ) {
    const module = await this.findOne(id);
    let fileUrl = module.fileUrl;

    if (file) {
      fileUrl = await this.storage.uploadFile(file, 'learning-modules');
    }

    return this.prisma.learningModule.update({
      where: { id },
      data: {
        ...dto,
        fileUrl,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.learningModule.delete({
      where: { id },
    });
  }
}
