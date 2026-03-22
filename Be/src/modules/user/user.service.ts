import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UserRole } from '../../../prisma/generated-client/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        payments: true,
        submissionVerifications: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string, currentAdminId: string) {
    // 1. Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 2. Prevent admin from deleting themselves
    if (user.id === currentAdminId) {
      throw new BadRequestException('Anda tidak dapat menghapus akun Anda sendiri');
    }

    // 3. Prevent deleting other admins (optional, depend on policy)
    if (user.role === UserRole.ADMIN) {
      // Logic for safety: maybe only super admin can delete other admins?
      // For now, let's allow it but log it or add extra check if needed.
    }

    // 4. Delete user (Cascading will handle related records)
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
