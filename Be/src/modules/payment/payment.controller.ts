import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../../prisma/generated-client/client';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User: Create a payment transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Already paid or payment pending' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTransaction(@GetUser('id') userId: string) {
    return this.paymentService.createTransaction(userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Public: Midtrans webhook callback' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async handleWebhook(@Body() payload: MidtransWebhookDto) {
    return this.paymentService.handleWebhook(payload);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: List all payments' })
  @ApiResponse({ status: 200, description: 'Return all payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll() {
    return this.paymentService.findAll();
  }
}
