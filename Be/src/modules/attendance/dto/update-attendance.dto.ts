import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../../prisma/generated-client/client';

export class UpdateAttendanceDto {
  @ApiProperty({
    enum: AttendanceStatus,
    description: 'The updated attendance status of the user',
    example: AttendanceStatus.PRESENT,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({
    example: 'Sakit dengan surat dokter',
    description: 'Additional notes or remarks regarding the attendance status',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
