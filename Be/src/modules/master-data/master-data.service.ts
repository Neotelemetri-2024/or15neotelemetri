import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateDivisionDto,
  UpdateDivisionDto,
  CreateSubDivisionDto,
  UpdateSubDivisionDto,
} from './dto/master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Department ---
  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Department name already exists');

    return this.prisma.department.create({ data: dto });
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    await this.findDepartmentOrThrow(id);
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDepartment(id: string) {
    await this.findDepartmentOrThrow(id);
    return this.prisma.department.delete({ where: { id } });
  }

  // --- Division ---
  async createDivision(dto: CreateDivisionDto) {
    const existing = await this.prisma.division.findUnique({
      where: {
        departmentId_name: {
          departmentId: dto.departmentId,
          name: dto.name,
        },
      },
    });
    if (existing)
      throw new ConflictException(
        'Division name already exists in this department',
      );

    return this.prisma.division.create({ data: dto });
  }

  async updateDivision(id: string, dto: UpdateDivisionDto) {
    await this.findDivisionOrThrow(id);
    return this.prisma.division.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDivision(id: string) {
    await this.findDivisionOrThrow(id);
    return this.prisma.division.delete({ where: { id } });
  }

  // --- SubDivision ---
  async createSubDivision(dto: CreateSubDivisionDto) {
    const existing = await this.prisma.subDivision.findUnique({
      where: {
        divisionId_name: {
          divisionId: dto.divisionId,
          name: dto.name,
        },
      },
    });
    if (existing)
      throw new ConflictException(
        'Subdivision name already exists in this division',
      );

    return this.prisma.subDivision.create({ data: dto });
  }

  async updateSubDivision(id: string, dto: UpdateSubDivisionDto) {
    await this.findSubDivisionOrThrow(id);
    return this.prisma.subDivision.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSubDivision(id: string) {
    await this.findSubDivisionOrThrow(id);
    return this.prisma.subDivision.delete({ where: { id } });
  }

  // --- Helpers ---
  private async findDepartmentOrThrow(id: string) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  private async findDivisionOrThrow(id: string) {
    const div = await this.prisma.division.findUnique({ where: { id } });
    if (!div) throw new NotFoundException('Division not found');
    return div;
  }

  private async findSubDivisionOrThrow(id: string) {
    const sub = await this.prisma.subDivision.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subdivision not found');
    return sub;
  }
}
