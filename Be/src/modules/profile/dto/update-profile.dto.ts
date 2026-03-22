import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Neo Telemetri',
    description: 'The full name of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'Neo',
    description: 'The nickname of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nickName?: string;

  @ApiPropertyOptional({
    example: '08123456789',
    description: 'The WhatsApp number of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber?: string;

  @ApiPropertyOptional({
    example: 'Sistem Informasi',
    description: 'The study program of the user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  studyProgram?: string;

  @ApiPropertyOptional({
    example: 'uuid-department',
    description: 'The department ID of the user',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'uuid-division',
    description: 'The division ID of the user',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  divisionId?: string;

  @ApiPropertyOptional({
    example: 'uuid-sub-division',
    description: 'The sub-division ID of the user',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subDivisionId?: string;
}
