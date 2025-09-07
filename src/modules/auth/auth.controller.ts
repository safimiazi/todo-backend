import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
async  register(@Body() body: { name: string; email: string; password: string }) {
    const result = await this.authService.register(body.name, body.email, body.password);
    return {name: result.name, email: result.email}
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
