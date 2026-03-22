import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateTimelineDto extends PartialType(CreateTimelineDto) {}

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recruitmentTimeline.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findOne(id: string) {
    const timeline = await this.prisma.recruitmentTimeline.findUnique({
      where: { id },
    });
    if (!timeline) throw new NotFoundException('Timeline event not found');
    return timeline;
  }

  async create(dto: CreateTimelineDto) {
    return this.prisma.recruitmentTimeline.create({
      data: {
        ...dto,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      },
    });
  }

  async update(id: string, dto: UpdateTimelineDto) {
    await this.findOne(id);
    const data: Record<string, any> = { ...dto };
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);

    return this.prisma.recruitmentTimeline.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruitmentTimeline.delete({
      where: { id },
    });
  }
}
