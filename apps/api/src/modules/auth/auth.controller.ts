import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Body() body: { email: string; otp: string }) {
    if (!body.email || !body.otp) {
      throw new UnauthorizedException("Veuillez fournir l'adresse email et le code OTP.");
    }
    return this.authService.activateAccount(body.email, body.otp);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() body: { email: string }) {
    if (!body.email) {
      throw new UnauthorizedException("Veuillez fournir l'adresse email.");
    }
    return this.authService.resendActivationOtp(body.email);
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

  @Post('confirm-reset-password')
  @HttpCode(HttpStatus.OK)
  async confirmResetPassword(
    @Body() body: { email: string; token: string; newPassword: string },
  ) {
    if (!body.email || !body.token || !body.newPassword) {
      throw new BadRequestException("L'adresse email, le jeton de sécurité et le nouveau mot de passe sont obligatoires.");
    }
    return this.authService.confirmPasswordReset(body.email, body.token, body.newPassword);
  }

  @Post('cleanup-smoke-test')
  @HttpCode(HttpStatus.OK)
  async cleanupSmokeTest() {
    return this.authService.deleteSmokeTestUser();
  }

  @Get('admin/users')
  async listUsers(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d authentification requis.');
    }
    const decoded = this.authService.verifyJwt(authHeader);
    if (!decoded) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }
    return this.authService.listAllUsers();
  }

  @Post('admin/clean-users')
  @HttpCode(HttpStatus.OK)
  async cleanUsers(
    @Headers('authorization') authHeader?: string,
    @Body() body?: { keepEmails?: string[]; deleteOrgs?: boolean },
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Token d authentification requis.');
    }
    const decoded = this.authService.verifyJwt(authHeader);
    if (!decoded) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }
    return this.authService.cleanUsers(body?.keepEmails, body?.deleteOrgs);
  }
}
