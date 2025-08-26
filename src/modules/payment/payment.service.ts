import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto/create-payment.dto';







@Injectable()
export class PaymentService {
    private stripe: Stripe

    constructor(private prisma: PrismaService, private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY', ''), {
    //  apiVersion: '2023-10-16',
    });
  }


  async createPayment(userId: string, dto: CreatePaymentDto) {
    const subscription = await this.prisma.subscription.findUnique({where: {userId}});
    if(!subscription)  throw new BadRequestException('there is no active subscription for this user');
    }
}
    
