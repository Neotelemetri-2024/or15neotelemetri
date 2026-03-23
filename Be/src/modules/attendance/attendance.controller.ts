import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ScanAttendanceDto } from './dto/scan-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../../prisma/generated-client/client';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Attendance')
@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // --- Admin: Activity Management ---

  @Post('activities')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Create a new activity' })
  createActivity(@Body() dto: CreateActivityDto) {
    return this.attendanceService.createActivity(dto);
  }

  @Get('activities')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all activities with stats' })
  findAllActivities() {
    return this.attendanceService.findAllActivities();
  }

  @Get('activities/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get activity details with attendance list' })
  findOneActivity(@Param('id') id: string) {
    return this.attendanceService.findOneActivity(id);
  }

  @Patch('activities/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Update activity' })
  updateActivity(@Param('id') id: string, @Body() dto: CreateActivityDto) {
    return this.attendanceService.updateActivity(id, dto);
  }

  @Delete('activities/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Delete activity' })
  removeActivity(@Param('id') id: string) {
    return this.attendanceService.removeActivity(id);
  }

  // --- Admin: Scan & Update Attendance ---

  @Post('scan')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Scan user QR Code for attendance' })
  scan(@Body() dto: ScanAttendanceDto) {
    return this.attendanceService.scanAttendance(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Manually update user attendance' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, dto);
  }

  // --- User: View My Attendance ---

  @Get('me')
  @ApiOperation({ summary: 'User: Get my attendance history' })
  getMyAttendances(@GetUser('id') userId: string) {
    return this.attendanceService.getMyAttendances(userId);
  }
}
