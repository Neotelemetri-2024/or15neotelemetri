import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/services/prisma.service';
import { CloudinaryStorageService } from '../../common/services/storage/cloudinary-storage.service';
import { CreateLearningModuleDto } from './dto/create-learning-module.dto';
import { UpdateLearningModuleDto } from './dto/update-learning-module.dto';
import { AttemptStatus } from '../../../prisma/generated-client/client';

@Injectable()
export class LearningModuleService {
  private readonly CACHE_KEY_ALL = 'learning_modules:all';
  private readonly CACHE_KEY_SUBDIVISION = 'learning_modules:subdivision:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: CloudinaryStorageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(
    dto: CreateLearningModuleDto,
    adminId: string,
    file: Express.Multer.File,
  ) {
    const fileUrl = await this.storage.uploadFile(file, 'learning-modules');

    const result = await this.prisma.learningModule.create({
      data: {
        ...dto,
        fileUrl,
        createdByAdminId: adminId,
      },
    });

    await this.clearCache(dto.subDivisionId);
    return result;
  }

  async findAll() {
    const cached = await this.cacheManager.get(this.CACHE_KEY_ALL);
    if (cached) return cached;

    const modules = await this.prisma.learningModule.findMany({
      include: {
        subDivision: true,
        createdByAdmin: {
          select: { profile: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(this.CACHE_KEY_ALL, modules);
    return modules;
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

    return this.findBySubDivision(profile.subDivisionId);
  }

  async findBySubDivision(subDivisionId: string) {
    const cacheKey = `${this.CACHE_KEY_SUBDIVISION}${subDivisionId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const modules = await this.prisma.learningModule.findMany({
      where: { subDivisionId },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, modules);
    return modules;
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

    const result = await this.prisma.learningModule.update({
      where: { id },
      data: {
        ...dto,
        fileUrl,
      },
    });

    await this.clearCache(module.subDivisionId);
    if (dto.subDivisionId && dto.subDivisionId !== module.subDivisionId) {
      await this.clearCache(dto.subDivisionId);
    }

    return result;
  }

  async remove(id: string) {
    const module = await this.findOne(id);
    const result = await this.prisma.learningModule.delete({
      where: { id },
    });

    await this.clearCache(module.subDivisionId);
    return result;
  }

  private async clearCache(subDivisionId?: string) {
    await this.cacheManager.del(this.CACHE_KEY_ALL);
    if (subDivisionId) {
      await this.cacheManager.del(`${this.CACHE_KEY_SUBDIVISION}${subDivisionId}`);
    }
  }
}
