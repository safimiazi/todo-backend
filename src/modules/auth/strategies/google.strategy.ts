import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
      passReqToCallback: false, // 👈 add this line
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // check if user exists
    let user = await this.prisma.user.findUnique({
      where: { googleId: id },
    });

    if (!user && emails?.length > 0) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: emails[0].value },
      });

      if (existingByEmail) {
        // link googleId to existing account
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: id },
        });
      } else {
        // create new user
        user = await this.prisma.user.create({
          data: {
            googleId: id,
            email: emails[0].value,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            avatar: photos?.[0]?.value || null,
            isEmailVerified: true,
          },
        });
      }
    }

    // generate JWT
    if (!user) {
      return done(new Error('User not found'), false);
    }
    const payload  = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    done(null, { access_token: token, user });
  }
}
