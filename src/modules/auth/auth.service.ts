import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    // ------------------ REGISTER ------------------
    async register(dto: RegisterDto) {
   
            // Check if email already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new BadRequestException('Email already registered');
            }

            const hashed = await bcrypt.hash(dto.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashed,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    avatar: dto.avatar ?? null,
                },
            });


            return
       
    }

    // ------------------ LOGIN ------------------
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

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
        const payload = { sub: userId, email, role };
        return {
            access_token: this.jwtService.sign(payload),
        };











        
    }


     // ---------------- EMAIL VERIFICATION ----------------
  async verifyEmail(token: string) {
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

    return { message: 'Email verified successfully' };
  }

  // ---------------- LOGIN ----------------
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new BadRequestException('Login method not supported for this account');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new BadRequestException('Invalid credentials');

    if (!user.isEmailVerified) throw new BadRequestException('Email not verified');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    const { password, ...result } = user;
    return { user: result, accessToken };
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

    return { message: 'Password reset email sent' };
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

    return { message: 'Password reset successfully' };
  }

    
}
