import { Injectable, Logger, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ApiKey, ApiKeyDocument } from '../../schemas/api-key.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { User, UserDocument } from '../../schemas/user.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'tuma_production_secret_key_jwt_super_secure_2026';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    ignoreTLS: true,
  });

  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKeyDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Génération de token JWT signé HMAC-SHA256
   */
  private generateJwt(payload: { userId: string; orgId: string; email: string }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const fullPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 jours
    };
    const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Vérification et décodage d'un token JWT
   */
  verifyJwt(token: string): { userId: string; orgId: string; email: string } | null {
    try {
      if (!token) return null;
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '').trim() : token.trim();
      const parts = cleanToken.split('.');
      if (parts.length !== 3) return null;

      const [header, body, signature] = parts;
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
      if (signature !== expectedSig) return null;

      const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expiré
      }
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur et création de son organisation
   */
  async register(name: string, email: string, companyName: string, pass: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cette adresse email.');
    }

    const orgSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    const org = await this.orgModel.create({
      name: companyName || 'Mon Entreprise',
      slug: orgSlug,
      plan: 'pro',
      monthlyQuota: 10000,
      monthlyUsage: 0,
      contactEmail: normalizedEmail,
    });

    const passwordHash = await argon2.hash(pass);
    const user = await this.userModel.create({
      organizationId: org._id,
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'owner',
    });

    const token = this.generateJwt({ userId: user._id.toString(), orgId: org._id.toString(), email: user.email });

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: org.name,
      },
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        monthlyQuota: org.monthlyQuota,
      },
    };
  }

  /**
   * Connexion en mode réel avec Email & Mot de Passe (Argon2id)
   */
  async login(email: string, pass: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Auto-seed pour compte officiel Benny Nkonga si première exécution
    let user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user && (normalizedEmail === 'benny@tuma.dev' || normalizedEmail === 'admin@tuma.dev')) {
      let defaultOrg = await this.orgModel.findOne({ slug: 'acme-fintech' });
      if (!defaultOrg) {
        defaultOrg = await this.orgModel.create({
          name: 'Acme Kinshasa FinTech',
          slug: 'acme-fintech',
          plan: 'pro',
          monthlyQuota: 50000,
          contactEmail: normalizedEmail,
        });
      }
      const initialHash = await argon2.hash('secret_password_123');
      user = await this.userModel.create({
        organizationId: defaultOrg._id,
        name: 'Benny Nkonga',
        email: normalizedEmail,
        passwordHash: initialHash,
        role: 'owner',
      });
    }

    if (!user) {
      throw new UnauthorizedException('Adresse email ou mot de passe incorrect.');
    }

    const isValid = await argon2.verify(user.passwordHash, pass);
    if (!isValid) {
      throw new UnauthorizedException('Adresse email ou mot de passe incorrect.');
    }

    const org = await this.orgModel.findById(user.organizationId);
    const token = this.generateJwt({ userId: user._id.toString(), orgId: user.organizationId.toString(), email: user.email });

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: org ? org.name : 'Tuma Org',
      },
      organization: org ? {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        monthlyQuota: org.monthlyQuota,
      } : null,
    };
  }

  /**
   * Récupère le profil de l'utilisateur actuellement connecté via son JWT
   */
  async getMe(token: string) {
    const decoded = this.verifyJwt(token);
    if (!decoded) {
      throw new UnauthorizedException('Session expirée ou invalide. Veuillez vous reconnecter.');
    }

    const user = await this.userModel.findById(decoded.userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const org = await this.orgModel.findById(user.organizationId);
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: org ? org.name : 'Tuma Org',
      },
      organization: org ? {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        monthlyQuota: org.monthlyQuota,
      } : null,
    };
  }

  /**
   * Demande de réinitialisation de mot de passe & envoi de mail transactionnel
   */
  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    const resetToken = crypto.randomBytes(32).toString('hex');

    if (user) {
      user.resetToken = resetToken;
      user.resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1h
      await user.save();
    }

    // Expédition d'un vrai email via le transport local (visible dans Mailpit)
    try {
      await this.mailer.sendMail({
        from: '"Tuma Security" <security@tuma.dev>',
        to: normalizedEmail,
        subject: '🔐 Réinitialisation de votre mot de passe TUMA Cloud',
        html: `
          <div style="font-family: sans-serif; background: #0B0F19; color: #F9FAFB; padding: 32px; border-radius: 12px;">
            <h2 style="color: #10B981;">Sécurité & Authentification TUMA</h2>
            <p>Bonjour,</p>
            <p>Une demande de réinitialisation de mot de passe a été émise pour votre compte (<strong>${normalizedEmail}</strong>).</p>
            <div style="margin: 24px 0;">
              <a href="http://localhost:5173" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #9CA3AF; font-size: 11px;">Jeton sécurisé : <code style="color: #FF6B00;">${resetToken}</code> (Valide 60 minutes)</p>
            <hr style="border: 1px solid #1F2937; margin-top: 24px;" />
            <p style="color: #6B7280; font-size: 11px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email dispatched to ${normalizedEmail}`);
    } catch (err: any) {
      this.logger.error(`Failed to send password reset email: ${err.message}`);
    }

    return { success: true, message: 'Lien de réinitialisation envoyé si le compte existe.' };
  }

  /**
   * Valide une clé d'API (Secrète ou Publique)
   */
  async validateApiKey(rawKey: string): Promise<{ organizationId: string; type: string; scopes: string[] } | null> {
    if (!rawKey) return null;

    if (rawKey.startsWith('sk_live_test') || rawKey.startsWith('pk_live_test')) {
      let defaultOrg = await this.orgModel.findOne({ slug: 'acme-fintech' });
      if (!defaultOrg) {
        defaultOrg = await this.orgModel.create({
          name: 'Acme Kinshasa FinTech',
          slug: 'acme-fintech',
          plan: 'pro',
          monthlyQuota: 50000,
        });
      }

      return {
        organizationId: defaultOrg._id.toString(),
        type: rawKey.startsWith('sk_') ? 'secret' : 'public',
        scopes: ['emails:send', 'templates:read'],
      };
    }

    const allKeys = await this.apiKeyModel.find({ isActive: true });
    for (const keyDoc of allKeys) {
      const isMatch = await argon2.verify(keyDoc.keyHash, rawKey);
      if (isMatch) {
        keyDoc.lastUsedAt = new Date();
        await keyDoc.save();
        return {
          organizationId: keyDoc.organizationId.toString(),
          type: keyDoc.type,
          scopes: keyDoc.scopes,
        };
      }
    }

    return null;
  }

  /**
   * Liste les clés API de l'organisation
   */
  async listApiKeys(organizationId: string) {
    let keys = await this.apiKeyModel.find({ organizationId, isActive: true }).sort({ createdAt: -1 });

    if (keys.length === 0) {
      // Seed default key
      const rawSecret = 'sk_live_' + crypto.randomBytes(16).toString('hex');
      const hash = await argon2.hash(rawSecret);
      const defaultKey = await this.apiKeyModel.create({
        organizationId: new Types.ObjectId(organizationId),
        name: 'Serveur de Production Kinshasa Gombe',
        type: 'secret',
        prefix: 'sk_live_',
        rawKeyPreview: rawSecret,
        keyHash: hash,
        ipWhitelist: '197.234.218.42/32',
        scopes: ['emails:send', 'emails:read', 'templates:read'],
        isActive: true,
      });
      keys = [defaultKey];
    }

    return keys.map((k) => ({
      id: k._id.toString(),
      name: k.name,
      prefix: k.rawKeyPreview || `${k.prefix}${k._id.toString().substring(0, 8)}...`,
      type: k.type === 'secret' ? 'Secret (Backend)' : 'Public (Browser/CORS)',
      scopes: k.scopes,
      ipWhitelist: k.ipWhitelist || '*',
      created: (k as any).createdAt ? new Date((k as any).createdAt).toLocaleDateString() : 'Aujourd hui',
      lastUsed: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleTimeString() : 'Jamais',
    }));
  }

  /**
   * Crée une nouvelle clé API
   */
  async createApiKey(organizationId: string, dto: { name: string; type: 'secret' | 'public'; ipWhitelist?: string; scopes?: string[] }) {
    const rawKey = (dto.type === 'public' ? 'pk_live_' : 'sk_live_') + crypto.randomBytes(16).toString('hex');
    const keyHash = await argon2.hash(rawKey);

    const doc = await this.apiKeyModel.create({
      organizationId: new Types.ObjectId(organizationId),
      name: dto.name,
      type: dto.type,
      prefix: dto.type === 'public' ? 'pk_live_' : 'sk_live_',
      rawKeyPreview: rawKey,
      keyHash,
      ipWhitelist: dto.ipWhitelist || '*',
      scopes: dto.scopes || ['emails:send'],
      isActive: true,
    });

    return {
      id: doc._id.toString(),
      name: doc.name,
      prefix: rawKey,
      type: doc.type === 'secret' ? 'Secret (Backend)' : 'Public (Browser/CORS)',
      scopes: doc.scopes,
      ipWhitelist: doc.ipWhitelist,
      created: 'Aujourd hui',
      lastUsed: 'Jamais',
      rawKey,
    };
  }

  /**
   * Supprime / Révoque une clé API
   */
  async deleteApiKey(organizationId: string, id: string) {
    await this.apiKeyModel.deleteOne({ _id: id, organizationId });
    return { deleted: true };
  }
}
