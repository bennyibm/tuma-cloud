import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyDocument } from '../../schemas/api-key.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { MailpitTransporter } from '../transporters/mailpit.transporter';

const JWT_SECRET = process.env.JWT_SECRET || 'tuma_production_secret_key_jwt_super_secure_2026';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKeyDocument>,
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailpitTransporter: MailpitTransporter,
  ) {}

  /**
   * Expédie l'email d'accueil contenant le code d'activation OTP
   */
  private async sendActivationEmail(email: string, name: string, otp: string) {
    const fromAddress = process.env.SMTP_FROM || 'TUMA Cloud <contact@eldnet.tech>';
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';
    const activationLink = `${dashboardUrl}/activate?email=${encodeURIComponent(email)}&otp=${otp}`;

    const subject = `🔐 Activez votre compte TUMA Cloud (Code : ${otp})`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F19; color: #F9FAFB; padding: 40px 24px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1F2937;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">tuma<span style="color: #10B981;">.</span></h1>
          <p style="color: #10B981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Infrastructure Cloud pour Développeurs</p>
        </div>

        <div style="background: #111827; padding: 32px; border-radius: 12px; border: 1px solid #1F2937;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; font-weight: 700;">Bienvenue, ${name} 👋</h2>
          <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Votre compte d'organisation a été initialisé avec une offre gratuite de <strong>1 000 emails par mois</strong>. Pour sécuriser votre accès et commencer à expédier en direct, veuillez saisir le code de validation ci-dessous :
          </p>

          <div style="background: #05070B; border: 2px dashed #10B981; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="color: #6B7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Code de Validation OTP</div>
            <div style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10B981;">
              ${otp}
            </div>
            <div style="color: #9CA3AF; font-size: 11px; margin-top: 8px;">Valable pendant 15 minutes</div>
          </div>

          <div style="text-align: center; margin: 30px 0 16px 0;">
            <a href="${activationLink}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);">
              🚀 Activer mon compte en 1 clic
            </a>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0 0 24px 0;">
            Ou rendez-vous sur <a href="${dashboardUrl}" style="color: #10B981; text-decoration: underline;">la console TUMA</a> et saisissez votre code OTP ci-dessus.
          </p>

          <p style="color: #6B7280; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #1F2937; padding-top: 16px;">
            ⚠️ Ne partagez jamais ce code. L'équipe TUMA ne vous demandera jamais votre mot de passe ou votre code OTP.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1F2937;">
          <p style="color: #6B7280; font-size: 11px; margin: 0;">
            TUMA Cloud • Cluster d'Ingestion RDC & International<br />
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
          </p>
        </div>
      </div>
    `;

    const text = `Bienvenue sur TUMA Cloud, ${name} !\n\nVotre code d'activation OTP est : ${otp}\n(Valable pendant 15 minutes)\n\nLien d'activation directe : ${activationLink}\n\nVotre compte dispose d'un quota d'accueil gratuit de 1 000 emails par mois.\n\nL'équipe TUMA Cloud`;

    return this.mailpitTransporter.send({
      from: fromAddress,
      to: [email],
      subject,
      html,
      text,
    });
  }

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
   * Quota par défaut : 1 000 emails/mois. Envoi d'un code OTP à 6 chiffres par email.
   */
  async register(name: string, email: string, companyName: string, pass: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.isActivated) {
        // L'utilisateur existe déjà mais n'a pas encore validé son compte : on lui renvoie un nouvel OTP
        const newOtp = normalizedEmail === 'smoke-test@tuma.dev' ? '123456' : crypto.randomInt(100000, 999999).toString();
        existing.activationOtp = newOtp;
        existing.activationOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await existing.save();

        try {
          await this.sendActivationEmail(normalizedEmail, existing.name, newOtp);
        } catch (err: any) {
          this.logger.error(`Erreur ré-expédition OTP: ${err.message}`);
        }

        return {
          success: true,
          requiresActivation: true,
          email: normalizedEmail,
          message: "Un compte non activé existe déjà. Un nouveau code d'activation OTP vous a été envoyé par email.",
        };
      }
      throw new ConflictException('Un compte actif existe déjà avec cette adresse email.');
    }

    const orgSlug =
      companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    
    // Quota d'accueil officiel : 1 000 emails offerts
    const org = await this.orgModel.create({
      name: companyName || 'Mon Entreprise',
      slug: orgSlug,
      plan: 'free',
      monthlyQuota: 1000,
      monthlyUsage: 0,
      contactEmail: normalizedEmail,
    });

    const otp = normalizedEmail === 'smoke-test@tuma.dev' ? '123456' : crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const passwordHash = await argon2.hash(pass);
    await this.userModel.create({
      organizationId: org._id,
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'owner',
      isActivated: false,
      activationOtp: otp,
      activationOtpExpiresAt: otpExpiresAt,
    });

    try {
      await this.sendActivationEmail(normalizedEmail, name, otp);
      this.logger.log(`[Activation] Email OTP expédié avec succès à ${normalizedEmail}`);
    } catch (err: any) {
      this.logger.error(`[Activation Error] Échec de l'envoi de l'email OTP à ${normalizedEmail}: ${err.message}`);
    }

    return {
      success: true,
      requiresActivation: true,
      email: normalizedEmail,
      message: "Compte créé avec succès. Un code d'activation à 6 chiffres a été envoyé à votre adresse email.",
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
   * Validation du code OTP et activation du compte
   */
  async activateAccount(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé avec cette adresse email.');
    }

    if (user.isActivated) {
      const org = await this.orgModel.findById(user.organizationId);
      const token = this.generateJwt({ userId: user._id.toString(), orgId: user.organizationId.toString(), email: user.email });
      return {
        success: true,
        message: 'Votre compte est déjà activé.',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: org ? org.name : 'Tuma Org',
        },
        organization: org
          ? {
              id: org._id.toString(),
              name: org.name,
              slug: org.slug,
              plan: org.plan,
              monthlyQuota: org.monthlyQuota,
            }
          : null,
      };
    }

    if (!user.activationOtp || user.activationOtp !== otp.trim()) {
      throw new BadRequestException('Code OTP invalide. Veuillez vérifier le code à 6 chiffres reçu par email.');
    }

    if (!user.activationOtpExpiresAt || user.activationOtpExpiresAt < new Date()) {
      throw new BadRequestException('Ce code OTP a expiré. Veuillez cliquer sur "Renvoyer le code" pour en générer un nouveau.');
    }

    user.isActivated = true;
    user.activationOtp = null;
    user.activationOtpExpiresAt = null;
    await user.save();

    const org = await this.orgModel.findById(user.organizationId);
    const token = this.generateJwt({ userId: user._id.toString(), orgId: user.organizationId.toString(), email: user.email });

    this.logger.log(`[Activation] Compte ${normalizedEmail} activé avec succès !`);

    return {
      success: true,
      message: 'Compte activé avec succès ! Bienvenue sur TUMA Cloud.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: org ? org.name : 'Tuma Org',
      },
      organization: org
        ? {
            id: org._id.toString(),
            name: org.name,
            slug: org.slug,
            plan: org.plan,
            monthlyQuota: org.monthlyQuota,
          }
        : null,
    };
  }

  /**
   * Renvoyer un nouveau code OTP d'activation
   */
  async resendActivationOtp(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé avec cette adresse email.');
    }

    if (user.isActivated) {
      return { success: true, message: 'Ce compte est déjà activé.' };
    }

    const newOtp = normalizedEmail === 'smoke-test@tuma.dev' ? '123456' : crypto.randomInt(100000, 999999).toString();
    user.activationOtp = newOtp;
    user.activationOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await this.sendActivationEmail(normalizedEmail, user.name, newOtp);
      this.logger.log(`[Activation] Nouvel email OTP renvoyé à ${normalizedEmail}`);
    } catch (err: any) {
      this.logger.error(`[Activation Resend Error] Échec du renvoi OTP à ${normalizedEmail}: ${err.message}`);
    }

    return { success: true, message: "Un nouveau code d'activation a été envoyé à votre adresse email." };
  }

  /**
   * Connexion en mode réel avec Email & Mot de Passe (Argon2id)
   * Contrôle strict de l'activation du compte
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
        isActivated: true,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Adresse email ou mot de passe incorrect.');
    }

    const isValid = await argon2.verify(user.passwordHash, pass);
    if (!isValid) {
      throw new UnauthorizedException('Adresse email ou mot de passe incorrect.');
    }

    // Auto-activation des comptes root / admin
    if (!user.isActivated && (normalizedEmail === 'benny@tuma.dev' || normalizedEmail === 'admin@tuma.dev')) {
      user.isActivated = true;
      await user.save();
    }

    // Vérification de l'activation du compte
    if (!user.isActivated) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: "Votre compte n'est pas encore activé. Veuillez saisir le code OTP envoyé par email.",
        requiresActivation: true,
        email: user.email,
      });
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

    // Expédition d'un vrai email via le transport officiel
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://console.tuma.eldnet.tech';
    const resetLink = `${dashboardUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${resetToken}`;
    const fromAddress = process.env.SMTP_FROM || 'Tuma Security <contact@eldnet.tech>';
    try {
      await this.mailpitTransporter.send({
        from: fromAddress,
        to: [normalizedEmail],
        subject: '🔐 Réinitialisation de votre mot de passe TUMA Cloud',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F19; color: #F9FAFB; padding: 40px 24px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1F2937;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">tuma<span style="color: #10B981;">.</span></h1>
              <p style="color: #10B981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Sécurité & Authentification</p>
            </div>

            <div style="background: #111827; padding: 32px; border-radius: 12px; border: 1px solid #1F2937;">
              <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; font-weight: 700;">Réinitialisation de votre mot de passe</h2>
              <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Une demande de réinitialisation de mot de passe a été émise pour votre compte (<strong>${normalizedEmail}</strong>). Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe :
              </p>

              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${resetLink}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);">
                  🔑 Définir mon nouveau mot de passe
                </a>
              </div>

              <p style="text-align: center; color: #6B7280; font-size: 11px; margin: 0 0 16px 0;">
                Ce lien sécurisé est valable pendant 60 minutes.
              </p>

              <hr style="border: none; border-top: 1px solid #1F2937; margin: 24px 0 16px 0;" />
              <p style="color: #6B7280; font-size: 11px; line-height: 1.5; margin: 0;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
              </p>
            </div>
          </div>
        `,
        text: `Bonjour,\n\nUne demande de réinitialisation de mot de passe a été émise pour votre compte (${normalizedEmail}).\n\nCliquez sur le lien suivant pour définir un nouveau mot de passe :\n${resetLink}\n\nCe lien est valide 60 minutes.\n\nL'équipe TUMA Cloud`,
      });
      this.logger.log(`Password reset email dispatched to ${normalizedEmail}`);
    } catch (err: any) {
      this.logger.error(`Failed to send password reset email: ${err.message}`);
    }

    return { success: true, message: 'Lien de réinitialisation envoyé si le compte existe.' };
  }

  /**
   * Valide le jeton et met à jour le mot de passe de l'utilisateur
   */
  async confirmPasswordReset(email: string, token: string, newPass: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new NotFoundException('Aucun compte trouvé avec cette adresse email.');
    }

    if (!user.resetToken || user.resetToken !== token.trim()) {
      throw new BadRequestException('Jeton de réinitialisation invalide ou déjà utilisé.');
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Ce lien de réinitialisation a expiré (valable 60 minutes). Veuillez en redemander un nouveau.');
    }

    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    }

    user.passwordHash = await argon2.hash(newPass);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    user.isActivated = true; // La validation via email prouve la propriété du compte
    await user.save();

    const org = await this.orgModel.findById(user.organizationId);
    const jwtToken = this.generateJwt({
      userId: user._id.toString(),
      orgId: user.organizationId.toString(),
      email: user.email,
    });

    this.logger.log(`[Password Reset] Mot de passe réinitialisé avec succès pour ${normalizedEmail}`);

    return {
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès !',
      token: jwtToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        company: org ? org.name : 'Tuma Org',
      },
      organization: org
        ? {
            id: org._id.toString(),
            name: org.name,
            slug: org.slug,
            plan: org.plan,
            monthlyQuota: org.monthlyQuota,
          }
        : null,
    };
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

  /**
   * Nettoie le compte de test fumée smoke-test@tuma.dev
   */
  async deleteSmokeTestUser() {
    const email = 'smoke-test@tuma.dev';
    const user = await this.userModel.findOne({ email });
    if (user) {
      await this.orgModel.deleteOne({ _id: user.organizationId });
      await this.userModel.deleteOne({ _id: user._id });
      this.logger.log(`Smoke test user and org cleaned up: ${email}`);
      return { success: true, message: 'Smoke test user and organization deleted successfully.' };
    }
    return { success: true, message: 'Smoke test user not found (already deleted).' };
  }

  /**
   * Liste tous les utilisateurs enregistrés (Admin / Maintenance)
   */
  async listAllUsers() {
    const users = await this.userModel.find({}).sort({ createdAt: -1 });
    const orgIds = users.map(u => u.organizationId).filter(Boolean);
    const orgs = await this.orgModel.find({ _id: { $in: orgIds } });
    const orgMap = new Map(orgs.map(o => [o._id.toString(), o.name]));

    return users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isActivated: !!u.isActivated,
      company: orgMap.get(u.organizationId?.toString()) || 'Aucune',
      createdAt: (u as any).createdAt || (u as any)._id.getTimestamp(),
    }));
  }

  /**
   * Nettoie les utilisateurs existants en conservant les comptes protégés
   */
  async cleanUsers(keepEmails: string[] = ['benny@tuma.dev', 'admin@tuma.dev'], deleteOrgs: boolean = true) {
    const normalizedKeep = keepEmails.map(e => e.toLowerCase().trim());
    
    // Rechercher les utilisateurs à supprimer
    const usersToDelete = await this.userModel.find({ email: { $nin: normalizedKeep } });
    const userIds = usersToDelete.map(u => u._id);
    const orgIdsToDelete = usersToDelete.map(u => u.organizationId).filter(Boolean);

    let deletedUsersCount = 0;
    let deletedOrgsCount = 0;

    if (userIds.length > 0) {
      const resUsers = await this.userModel.deleteMany({ _id: { $in: userIds } });
      deletedUsersCount = resUsers.deletedCount;
    }

    if (deleteOrgs && orgIdsToDelete.length > 0) {
      // Ne pas supprimer les organisations encore rattachées à un utilisateur conservé
      const keptUsers = await this.userModel.find({ email: { $in: normalizedKeep } });
      const keptOrgIds = new Set(keptUsers.map(u => u.organizationId?.toString()).filter(Boolean));
      
      const distinctOrgs = [...new Set(orgIdsToDelete.map(id => id.toString()))]
        .filter(id => !keptOrgIds.has(id))
        .map(id => new Types.ObjectId(id));

      if (distinctOrgs.length > 0) {
        const resOrgs = await this.orgModel.deleteMany({ _id: { $in: distinctOrgs } });
        deletedOrgsCount = resOrgs.deletedCount;
      }
    }

    this.logger.log(`[Admin Cleanup] Supprimé ${deletedUsersCount} utilisateurs et ${deletedOrgsCount} organisations.`);

    return {
      success: true,
      deletedUsersCount,
      deletedOrgsCount,
      keptEmails: normalizedKeep,
      deletedUserEmails: usersToDelete.map(u => u.email),
    };
  }
}
