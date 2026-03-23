import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ScanAttendanceDto } from './dto/scan-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus } from '../../../prisma/generated-client/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Activity Management (Admin) ---

  async createActivity(dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        name: dto.name,
        deadline: new Date(dto.deadline),
      },
    });

    // Auto-create ABSENT records for all APPROVED users
    const approvedUsers = await this.prisma.user.findMany({
      where: {
        submissionVerifications: {
          some: { status: 'APPROVED' },
        },
        role: 'USER',
      },
    });

    const attendanceData = approvedUsers.map((user) => ({
      userId: user.id,
      activityId: activity.id,
      status: AttendanceStatus.ABSENT,
    }));

    if (attendanceData.length > 0) {
      await this.prisma.attendance.createMany({
        data: attendanceData,
      });
    }

    return activity;
  }

  async findAllActivities() {
    const activities = await this.prisma.activity.findMany({
      include: {
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get detailed stats for each activity
    const activitiesWithStats = await Promise.all(
      activities.map(async (activity) => {
        const stats = await this.prisma.attendance.groupBy({
          by: ['status'],
          where: { activityId: activity.id },
          _count: true,
        });

        const formattedStats = {
          present: stats.find((s) => s.status === AttendanceStatus.PRESENT)?._count || 0,
          absent: stats.find((s) => s.status === AttendanceStatus.ABSENT)?._count || 0,
          excused: stats.find((s) => s.status === AttendanceStatus.EXCUSED)?._count || 0,
          sick: stats.find((s) => s.status === AttendanceStatus.SICK)?._count || 0,
        };

        return {
          ...activity,
          stats: formattedStats,
        };
      }),
    );

    return activitiesWithStats;
  }

  async findOneActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, nim: true } },
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    return activity;
  }

  async updateActivity(id: string, dto: CreateActivityDto) {
    await this.findOneActivity(id);
    return await this.prisma.activity.update({
      where: { id },
      data: {
        name: dto.name,
        deadline: new Date(dto.deadline),
      },
    });
  }

  async removeActivity(id: string) {
    await this.findOneActivity(id);
    return await this.prisma.activity.delete({
      where: { id },
    });
  }

  // --- Attendance Logic ---

  async scanAttendance(dto: ScanAttendanceDto) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const now = new Date();
    if (now > activity.deadline) {
      throw new BadRequestException('Waktu absensi untuk kegiatan ini sudah berakhir');
    }

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_activityId: {
          userId: dto.userId,
          activityId: dto.activityId,
        },
      },
    });

    if (!attendance) {
      // Check if user exists and is approved
      const user = await this.prisma.user.findFirst({
        where: {
          id: dto.userId,
          submissionVerifications: { some: { status: 'APPROVED' } },
        },
      });

      if (!user) {
        throw new BadRequestException('User tidak ditemukan atau belum diverifikasi');
      }

      return await this.prisma.attendance.create({
        data: {
          userId: dto.userId,
          activityId: dto.activityId,
          status: AttendanceStatus.PRESENT,
          checkInTime: now,
        },
      });
    }

    return await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        status: AttendanceStatus.PRESENT,
        checkInTime: now,
      },
    });
  }

  async updateAttendance(attendanceId: string, dto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Data absensi tidak ditemukan');
    }

    return await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: dto.status,
        notes: dto.notes,
        checkInTime: dto.status === AttendanceStatus.PRESENT ? new Date() : attendance.checkInTime,
      },
    });
  }

  async getMyAttendances(userId: string) {
    return await this.prisma.attendance.findMany({
      where: { userId },
      include: {
        activity: true,
      },
      orderBy: {
        activity: {
          createdAt: 'desc',
        },
      },
    });
  }
}
