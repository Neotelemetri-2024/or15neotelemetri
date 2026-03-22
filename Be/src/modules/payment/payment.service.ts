import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/services/prisma.service';
import {
  PaymentStatus,
  PaymentProvider,
} from '../../../prisma/generated-client/client';
import { MidtransWebhookDto } from './dto/midtrans-webhook.dto';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly snap: any;
  private readonly REGISTRATION_FEE = 50000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    this.snap = new midtransClient.Snap({
      isProduction:
        this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createTransaction(userId: string) {
    // 1. Check user profile and verification status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        submissionVerifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || !user.profile) {
      throw new BadRequestException('Lengkapi profil terlebih dahulu');
    }

    const verification = user.submissionVerifications[0];
    if (!verification || verification.status !== 'APPROVED') {
      throw new BadRequestException(
        'Berkas pendaftaran harus disetujui (APPROVED) sebelum melakukan pembayaran',
      );
    }

    // 2. Check if user already has a PAID or PENDING payment
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        status: { in: [PaymentStatus.PAID, PaymentStatus.PENDING] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.PAID) {
        throw new BadRequestException('Anda sudah melunasi pembayaran');
      }
      // If PENDING, return the existing payment URL
      if (existingPayment.paymentUrl) {
        return {
          paymentUrl: existingPayment.paymentUrl,
          status: existingPayment.status,
          amount: existingPayment.amount,
        };
      }
    }

    // 3. Prepare Midtrans transaction
    const orderId = `OR-NEO-${Date.now()}-${userId.substring(0, 8)}`;
    const amount = this.REGISTRATION_FEE;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.profile.fullName,
        email: user.email,
        phone: user.profile.whatsappNumber,
      },
      callbacks: {
        finish: `${this.configService.get<string>('FRONTEND_URL')}/dashboard`,
        error: `${this.configService.get<string>('FRONTEND_URL')}/dashboard`,
        pending: `${this.configService.get<string>('FRONTEND_URL')}/dashboard`,
      },
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const transaction = await this.snap.createTransaction(parameter);

      // 4. Save to database
      const payment = await this.prisma.payment.create({
        data: {
          id: orderId, // Use order_id as PK for easier lookup in webhook
          userId,
          provider: PaymentProvider.MIDTRANS,
          amount,
          status: PaymentStatus.PENDING,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          paymentUrl: transaction.redirect_url as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          externalPaymentId: transaction.token as string,
        },
      });

      return {
        paymentUrl: payment.paymentUrl,
        status: payment.status,
        amount: payment.amount,
      };
    } catch (error) {
      this.logger.error('Midtrans transaction creation failed', error);
      throw new BadRequestException('Gagal membuat transaksi pembayaran');
    }
  }

  async handleWebhook(payload: MidtransWebhookDto) {
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = payload;

    this.logger.log(
      `Received Midtrans webhook: ${order_id} - ${transaction_status}`,
    );

    // Verify Signature Key
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      this.logger.error(`Invalid Midtrans signature for order: ${order_id}`);
      throw new UnauthorizedException('Invalid signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: order_id },
    });

    if (!payment) {
      this.logger.warn(`Payment with order_id ${order_id} not found`);
      throw new BadRequestException('Payment not found');
    }

    let status: PaymentStatus = payment.status;

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        status = PaymentStatus.PENDING;
      } else if (fraud_status === 'accept') {
        status = PaymentStatus.PAID;
      }
    } else if (transaction_status === 'settlement') {
      status = PaymentStatus.PAID;
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      status = PaymentStatus.FAILED;
    } else if (transaction_status === 'pending') {
      status = PaymentStatus.PENDING;
    }

    try {
      return await this.prisma.payment.update({
        where: { id: order_id },
        data: {
          status,
          paidAt: status === PaymentStatus.PAID ? new Date() : null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update payment status for ${order_id}`, error);
      throw new BadRequestException('Failed to update payment status');
    }
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true, nim: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
