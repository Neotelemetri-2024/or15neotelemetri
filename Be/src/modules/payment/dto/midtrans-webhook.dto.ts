import { IsString, IsNotEmpty, IsOptional, IsNumberString } from 'class-validator';

export class MidtransWebhookDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  transaction_status: string;

  @IsString()
  @IsNotEmpty()
  fraud_status: string;

  @IsString()
  @IsNotEmpty()
  status_code: string;

  @IsNumberString()
  @IsNotEmpty()
  gross_amount: string;

  @IsString()
  @IsNotEmpty()
  signature_key: string;

  @IsString()
  @IsOptional()
  payment_type?: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  transaction_time?: string;
}
