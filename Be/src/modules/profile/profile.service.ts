import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { IStorageService } from '../../common/services/storage/storage.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async getProfile(userId: string) {
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

    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const avatarUrl = await this.storageService.uploadFile(
      file,
      'profiles/avatars',
    );

    return this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });
  }
}
