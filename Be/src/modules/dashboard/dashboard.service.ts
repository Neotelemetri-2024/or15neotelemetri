import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyDashboard(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        department: true,
        division: true,
        subDivision: true,
      },
    });

    const verification = await this.prisma.submissionVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const payment = await this.prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const timeline = await this.prisma.recruitmentTimeline.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // Check progress
    const isProfileComplete = !!(
      profile?.fullName &&
      profile?.nim &&
      profile?.whatsappNumber &&
      profile?.studyProgram &&
      profile?.departmentId &&
      profile?.divisionId &&
      profile?.subDivisionId
    );

    const verificationStatus = verification?.status || 'NOT_STARTED';
    const paymentStatus = payment?.status || 'NOT_STARTED';

    // Calculate current step
    let currentStep = 1;
    if (isProfileComplete) {
      currentStep = 2;
      if (verificationStatus === 'APPROVED') {
        currentStep = 3;
        if (paymentStatus === 'PAID') {
          currentStep = 4;
        }
      }
    }

    const examAttempt = await this.prisma.examAttempt.findFirst({
      where: { userId, status: 'SUBMITTED' },
    });

    const steps = [
      {
        step: 1,
        title: 'Lengkapi Profil',
        description: 'Isi data diri dan pilih subdivisi yang kamu minati.',
        isCompleted: isProfileComplete,
      },
      {
        step: 2,
        title: 'Verifikasi Berkas',
        description:
          'Upload dokumen yang diperlukan untuk verifikasi pendaftaran.',
        isCompleted: verificationStatus === 'APPROVED',
        status: verificationStatus,
      },
      {
        step: 3,
        title: 'Pembayaran',
        description:
          'Lakukan pembayaran biaya pendaftaran untuk melanjutkan ke tahap ujian.',
        isCompleted: paymentStatus === 'PAID',
        status: paymentStatus,
      },
      {
        step: 4,
        title: 'Ujian Seleksi',
        description: 'Kerjakan ujian sesuai subdivisi yang kamu pilih.',
        isCompleted: !!examAttempt,
        status: examAttempt ? 'COMPLETED' : 'PENDING',
      },
    ];

    const now = new Date();
    const nextTimelineEvent = timeline.find((t) => t.startAt > now);

    return {
      user: {
        id: userId,
        fullName: profile?.fullName,
        subDivision: profile?.subDivision?.name,
      },
      progress: {
        currentStep,
        totalSteps: steps.length,
        percentage: Math.round(((currentStep - 1) / steps.length) * 100),
      },
      steps,
      timeline,
      nextTimelineEvent,
    };
  }

  async getAdminStats() {
    const totalUsers = await this.prisma.user.count({
      where: { role: 'USER' },
    });

    const verificationStats = await this.prisma.submissionVerification.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const paymentStats = await this.prisma.payment.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    // SubDivision Distribution
    const subDivisions = await this.prisma.subDivision.findMany({
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    const subDivisionDistribution = subDivisions.map((sd) => ({
      name: sd.name,
      applicantCount: sd._count.profiles,
    }));

    return {
      overview: {
        totalRegistrants: totalUsers,
      },
      verifications: verificationStats.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      payments: paymentStats.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      distribution: subDivisionDistribution,
    };
  }
}
