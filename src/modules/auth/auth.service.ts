import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

// Utility function to add minutes to a Date
function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    // ---------------- REGISTER ----------------
    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) throw new BadRequestException('Email already registered');

        const hashed = await bcrypt.hash(dto.password, 10);
        const emailToken = uuidv4();

        // Prisma transaction
        const user = await this.prisma.$transaction(async (prismaTx) => {
            const newUser = await prismaTx.user.create({
                data: {
                    email: dto.email,
                    password: hashed,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    avatar: dto.avatar ?? null,
                    emailVerificiationToken: emailToken,
                    emailVerifiedAt: null,
                },
            });

            try {
                // email send
                await this.mailService.sendEmailVerification(newUser.email, emailToken);
            } catch (err) {
                // throw error to rollback transaction
                throw new Error(`Email sending failed: ${err.message}`);
            }

            return newUser;
        });

        const { password, ...result } = user;
        return result;
    }

    // ------------------ LOGIN ------------------
async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedException({
      message: 'User not found with this email',
      code: 'USER_NOT_FOUND',
    });
  }

  if(user.isDeleted){
    throw new UnauthorizedException({
      message: 'User account is deleted',
      code: 'USER_DELETED',
    });
  }

  const passwordValid = await bcrypt.compare(dto.password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedException({
      message: 'Password is incorrect',
      code: 'INVALID_PASSWORD',
    });
  }

  return this.generateTokens(user.id, user.email, user.role);
}


    // ------------------ VALIDATE USER (local strategy er jonno) ------------------
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        return valid ? user : null;
    }

    // ------------------ GENERATE TOKENS ------------------
    private generateTokens(userId: string, email: string, role: string) {
        const payload = {  userId, email, role };
        return {
            accessToken: this.jwtService.sign(payload),
        };


    }


    // ---------------- EMAIL VERIFICATION ----------------
    async verifyEmail(token: string) {
        const isVerifiedEmail = await this.prisma.user.findFirst({ where: { isEmailVerified: true } });
        if (isVerifiedEmail) throw new BadRequestException('Email is already verified');

        const user = await this.prisma.user.findFirst({ where: { emailVerificiationToken: token } });


        if (!user) throw new BadRequestException('Invalid verification token');

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                emailVerificiationToken: null,
            },
        });

        return
    }



    // ---------------- PASSWORD RESET REQUEST ----------------
    async requestPasswordReset(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('User not found');

        const resetToken = uuidv4();
        const resetExpires = addMinutes(new Date(), 30);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });

        // send reset email
        await this.mailService.sendPasswordReset(email, resetToken);

        return
    }

    // ---------------- PASSWORD RESET ----------------
    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({ where: { passwordResetToken: token } });
        if (!user || !user.passwordResetExpires || new Date() > user.passwordResetExpires)
            throw new BadRequestException('Invalid or expired reset token');

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return
    }


}
