import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { successResponse } from 'src/common/response/response.util';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        try {
            const result = await this.authService.register(dto);

            return successResponse(result, 'User registered successfully');
        } catch (error) {
            throw error;
        }
    }

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto) {
        const data = await this.authService.login(dto);
        return successResponse(data, 'Login successful');
    }

 @UseGuards(LocalAuthGuard)
    @Post('profile')
    getProfile(@Req() req) {
        return req.user;
    }

    // ---------------- Google OAuth ----------------
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // passport will redirect to Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        return req.user; // { access_token, user }
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Req() req) {
        const { token } = req.query;
        const result = await this.authService.verifyEmail(token as string);
        return successResponse(result, "Email verified successfully");
    }

    @Public()
    @Post('request-password-reset')
    async requestPasswordReset(@Body('email') email: string) {
        const result = await this.authService.requestPasswordReset(email);
        return successResponse(result, 'Password reset email sent');
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; password: string }) {
        const result = await this.authService.resetPassword(body.token, body.password);
        return successResponse(result, 'Password reset successful');
    }
}
