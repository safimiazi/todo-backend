import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!, // 👈 add "!" to assert it's not undefined
    });
  }

  async validate(payload: any) {
    // Fetch user from DB using the 'id' from payload (now consistent)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id }, // Use 'id' from payload
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return the full user or specific fields (req.user will have this)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // Add other fields if needed, e.g., firstName: user.firstName
    };
  }
}
