import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { name: string; email: string; company: string; password?: string },
  ) {
    return this.authService.register(
      body.name,
      body.email,
      body.company,
      body.password || 'default_secure_pass',
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password?: string }) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Veuillez fournir un email et un mot de passe.');
    }
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d authentification manquant.');
    }
    return this.authService.getMe(authHeader);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }
}
