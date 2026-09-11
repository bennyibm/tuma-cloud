import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
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

  // ============================================================================
  // GOOGLE OAUTH 2.0 (SSO)
  // ============================================================================

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.tuma.eldnet.tech'}/v1/auth/google/callback`;

    if (!clientId) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          "L'authentification Google OAuth n'est pas encore configurée (GOOGLE_CLIENT_ID manquant sur le serveur).",
        )}`,
      );
    }

    const scope = encodeURIComponent('openid email profile');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`;

    return res.redirect(googleAuthUrl);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';

    if (error || !code) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          error || 'Autorisation Google annulée ou code d autorisation manquant.',
        )}`,
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.tuma.eldnet.tech'}/v1/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          'Identifiants Google OAuth non configurés sur le serveur.',
        )}`,
      );
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            `Échec de validation Google Token : ${errText}`,
          )}`,
        );
      }

      const tokenData = (await tokenRes.json()) as { access_token?: string };
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            'Jeton d accès Google introuvable dans la réponse.',
          )}`,
        );
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!profileRes.ok) {
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            'Impossible de récupérer le profil utilisateur Google.',
          )}`,
        );
      }

      const profile = (await profileRes.json()) as {
        sub: string;
        email: string;
        name?: string;
        picture?: string;
      };

      const authResult = await this.authService.handleGoogleAuth(profile);

      return res.redirect(`${dashboardUrl}/auth/callback?token=${authResult.token}`);
    } catch (err: any) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          err.message || "Une erreur est survenue lors de l'authentification Google.",
        )}`,
      );
    }
  }

  // ============================================================================
  // GITHUB OAUTH (SSO)
  // ============================================================================

  @Get('github')
  async githubAuth(@Res() res: Response) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';
    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.tuma.eldnet.tech'}/v1/auth/github/callback`;

    if (!clientId) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          "L'authentification GitHub OAuth n'est pas encore configurée (GITHUB_CLIENT_ID manquant sur le serveur).",
        )}`,
      );
    }

    const scope = encodeURIComponent('user:email');
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}`;

    return res.redirect(githubAuthUrl);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';

    if (error || !code) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          error || 'Autorisation GitHub annulée ou code d autorisation manquant.',
        )}`,
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const callbackUrl =
      process.env.GITHUB_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.tuma.eldnet.tech'}/v1/auth/github/callback`;

    if (!clientId || !clientSecret) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          'Identifiants GitHub OAuth non configurés sur le serveur.',
        )}`,
      );
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            `Échec de validation GitHub Token : ${errText}`,
          )}`,
        );
      }

      const tokenData = (await tokenRes.json()) as {
        access_token?: string;
        error_description?: string;
      };
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            tokenData.error_description || 'Jeton d accès GitHub manquant.',
          )}`,
        );
      }

      const profileRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'TUMA-Cloud-OAuth',
        },
      });

      if (!profileRes.ok) {
        return res.redirect(
          `${dashboardUrl}/login?error=${encodeURIComponent(
            'Impossible de récupérer le profil utilisateur GitHub.',
          )}`,
        );
      }

      const profile = (await profileRes.json()) as {
        id: string | number;
        email?: string;
        name?: string;
        login?: string;
        avatar_url?: string;
      };

      if (!profile.email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'TUMA-Cloud-OAuth',
          },
        });

        if (emailsRes.ok) {
          const emails: Array<{ email: string; primary: boolean; verified: boolean }> =
            (await emailsRes.json()) as any;
          const primary =
            emails.find((e) => e.primary && e.verified) ||
            emails.find((e) => e.verified) ||
            emails[0];
          if (primary) {
            profile.email = primary.email;
          }
        }
      }

      const authResult = await this.authService.handleGithubAuth(profile as any);

      return res.redirect(`${dashboardUrl}/auth/callback?token=${authResult.token}`);
    } catch (err: any) {
      return res.redirect(
        `${dashboardUrl}/login?error=${encodeURIComponent(
          err.message || "Une erreur est survenue lors de l'authentification GitHub.",
        )}`,
      );
    }
  }
}
