import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../../prisma/generated-client/enums';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CheckInDto } from './dto/check-in.dto';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Scan QR Code for attendance' })
  @ApiResponse({
    status: 201,
    description: 'Attendance successfully recorded',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid passcode or time' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async checkIn(@GetUser('id') userId: string, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(userId, dto);
  }

  @Get('me')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get current user attendance history' })
  @ApiResponse({
    status: 200,
    description: 'Return personal attendance history',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getMyAttendances(@GetUser('id') userId: string) {
    return this.attendanceService.getMyAttendances(userId);
  }

  @Post('passcode')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Set/Generate passcode for an event' })
  @ApiResponse({ status: 201, description: 'Passcode successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async setPasscode(@Body() dto: GenerateQrDto) {
    return this.attendanceService.setPasscode(dto.timelineId, dto.passcode);
  }

  @Get('timeline/:timelineId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all attendance records for an event' })
  @ApiResponse({
    status: 200,
    description: 'Return list of attendees and absentees',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not Found - Timeline event not found' })
  async getTimelineAttendance(@Param('timelineId') timelineId: string) {
    return this.attendanceService.getTimelineAttendance(timelineId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Manually update user attendance status' })
  @ApiResponse({ status: 200, description: 'Attendance record updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not Found - Attendance record not found' })
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(id, dto);
  }
}
