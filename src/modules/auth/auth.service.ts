import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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
}
