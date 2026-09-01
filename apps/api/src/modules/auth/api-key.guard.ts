import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['x-api-key'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header. Expected Bearer sk_live_... or JWT token');
    }

    const key = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

    // 1. Vérifier si c'est un token JWT utilisateur
    const decodedJwt = this.authService.verifyJwt(key);
    if (decodedJwt && decodedJwt.orgId) {
      request.organizationId = decodedJwt.orgId;
      request.userId = decodedJwt.userId;
      request.apiKeyType = 'jwt';
      request.apiKeyScopes = ['*'];
      return true;
    }

    // 2. Vérifier si c'est une clé API (sk_live_..., pk_live_...)
    const authData = await this.authService.validateApiKey(key);
    if (authData) {
      request.organizationId = authData.organizationId;
      request.apiKeyType = authData.type;
      request.apiKeyScopes = authData.scopes;
      return true;
    }

    throw new UnauthorizedException('Invalid API Key or JWT token.');
  }
}
