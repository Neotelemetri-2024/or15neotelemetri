import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The ID of the recruitment timeline event',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  timelineId: string;

  @ApiProperty({
    example: 'TOKEN123',
    description: 'The passcode extracted from the scanned QR code',
  })
  @IsNotEmpty()
  @IsString()
  passcode: string;
}
