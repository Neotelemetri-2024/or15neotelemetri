import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateQrDto {
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
    description: 'The secure passcode to be encoded in the QR code',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  passcode: string;
}
