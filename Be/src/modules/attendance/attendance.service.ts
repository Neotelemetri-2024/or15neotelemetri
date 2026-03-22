import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus } from '../../../prisma/generated-client/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInDto) {
    const timeline = await this.prisma.recruitmentTimeline.findUnique({
      where: { id: dto.timelineId },
    });

    if (!timeline) {
      throw new NotFoundException('Event timeline tidak ditemukan');
    }

    if (!timeline.attendancePasscode) {
      throw new BadRequestException('Absensi belum diaktifkan untuk event ini');
    }

    if (timeline.attendancePasscode !== dto.passcode) {
      throw new BadRequestException(
        'QR Code tidak valid atau sudah kadaluarsa',
      );
    }

    const now = new Date();
    if (now < timeline.startAt || now > timeline.endAt) {
      throw new BadRequestException(
        'Waktu absensi belum dimulai atau sudah berakhir',
      );
    }

    // Cek apakah user sudah diverifikasi (APPROVED)
    const verification = await this.prisma.submissionVerification.findFirst({
      where: { userId, status: 'APPROVED' },
    });

    if (!verification) {
      throw new BadRequestException(
        'Anda belum diverifikasi. Silakan lengkapi pendaftaran.',
      );
    }

    try {
      return await this.prisma.attendance.upsert({
        where: {
          userId_timelineId: {
            userId,
            timelineId: dto.timelineId,
          },
        },
        update: {
          status: AttendanceStatus.PRESENT,
          checkInTime: now,
        },
        create: {
          userId,
          timelineId: dto.timelineId,
          status: AttendanceStatus.PRESENT,
          checkInTime: now,
        },
      });
    } catch {
      throw new BadRequestException('Gagal melakukan absensi');
    }
  }

  async setPasscode(timelineId: string, passcode: string) {
    const timeline = await this.prisma.recruitmentTimeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new NotFoundException('Event timeline tidak ditemukan');
    }

    return await this.prisma.recruitmentTimeline.update({
      where: { id: timelineId },
      data: { attendancePasscode: passcode },
    });
  }

  async getTimelineAttendance(timelineId: string) {
    const timeline = await this.prisma.recruitmentTimeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new NotFoundException('Event timeline tidak ditemukan');
    }

    // Ambil semua user yang pendaftarannya APPROVED
    const approvedUsers = await this.prisma.user.findMany({
      where: {
        submissionVerifications: {
          some: { status: 'APPROVED' },
        },
        role: 'USER',
      },
      include: {
        profile: true,
        attendances: {
          where: { timelineId },
        },
      },
    });

    return approvedUsers.map((user) => {
      const attendance = user.attendances[0];
      return {
        userId: user.id,
        fullName: user.profile?.fullName,
        nim: user.profile?.nim,
        status: attendance ? attendance.status : AttendanceStatus.ABSENT,
        checkInTime: attendance ? attendance.checkInTime : null,
        notes: attendance ? attendance.notes : null,
      };
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
      },
    });
  }

  async getMyAttendances(userId: string) {
    return await this.prisma.attendance.findMany({
      where: { userId },
      include: {
        timeline: {
          select: {
            title: true,
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: {
        timeline: {
          startAt: 'desc',
        },
      },
    });
  }
}
