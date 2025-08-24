import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { resetPasswordTemplate, verificationTemplate } from './templates/email-templates';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmailVerification(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify Your Email',
      html: verificationTemplate(url),
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password',
      html: resetPasswordTemplate(url),
    });
  }
}
