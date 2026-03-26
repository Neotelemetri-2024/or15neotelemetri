import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../common/services/prisma.service';
import { IStorageService } from '../../common/services/storage/storage.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly CACHE_KEY_PREFIX = 'profile:user:';

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getProfile(userId: string) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        department: true,
        division: true,
        subDivision: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Cache profile for 1 hour (3,600,000 ms)
    await this.cacheManager.set(cacheKey, profile, 3600000);
    return profile;
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getDivisions(departmentId: string) {
    return this.prisma.division.findMany({
      where: { departmentId },
      orderBy: { name: 'asc' },
    });
  }

  async getSubDivisions(divisionId: string) {
    return this.prisma.subDivision.findMany({
      where: { divisionId },
      orderBy: { name: 'asc' },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Validasi Hierarki jika data diubah
    if (dto.departmentId && dto.divisionId) {
      const division = await this.prisma.division.findUnique({
        where: { id: dto.divisionId },
      });

      if (!division || division.departmentId !== dto.departmentId) {
        throw new BadRequestException(
          'Divisi yang dipilih tidak terdaftar di departemen tersebut',
        );
      }
    }

    if (dto.divisionId && dto.subDivisionId) {
      const subDivision = await this.prisma.subDivision.findUnique({
        where: { id: dto.subDivisionId },
      });

      if (!subDivision || subDivision.divisionId !== dto.divisionId) {
        throw new BadRequestException(
          'Sub-divisi yang dipilih tidak terdaftar di divisi tersebut',
        );
      }
    }

    const result = await this.prisma.profile.update({
      where: { userId },
      data: dto,
    });

    await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${userId}`);
    return result;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const avatarUrl = await this.storageService.uploadFile(
      file,
      'profiles/avatars',
    );

    const result = await this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });

    await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}${userId}`);
    return result;
  }
}
