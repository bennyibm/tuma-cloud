import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from '../../schemas/template.schema';
import { TemplateCompilerService } from './template-compiler.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
    private readonly compiler: TemplateCompilerService,
  ) {}

  /**
   * Liste les templates d'une organisation (avec pré-chargement des modèles Pro si vide)
   */
  async listTemplates(organizationId: string): Promise<Template[]> {
    let list = await this.templateModel.find({ organizationId }).sort({ createdAt: -1 });

    if (list.length === 0) {
      // Seed des modèles Pro (Canva style)
      const defaultTemplates = [
        {
          organizationId: new Types.ObjectId(organizationId),
          name: '🛍️ Reçu de Paiement Mobile Money',
          slug: 'mobile-money-receipt',
          subject: 'Reçu de votre transaction {{transactionId}} ({{amount}} {{currency}})',
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0F19; color: #F9FAFB; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="background: rgba(16, 185, 129, 0.15); display: inline-block; padding: 12px 24px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-weight: bold; font-size: 14px;">
      ✓ Paiement Confirmé
    </div>
    <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 8px 0; font-weight: 800;">{{amount}} {{currency}}</h1>
    <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Réf: {{transactionId}} • Opérateur: {{provider}}</p>
  </div>

  <div style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px 0;">Détails de la Facture</h3>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr>
        <td style="color: #9CA3AF; padding: 8px 0;">Client</td>
        <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0;">{{customerName}}</td>
      </tr>
      <tr>
        <td style="color: #9CA3AF; padding: 8px 0;">Numéro Mobile</td>
        <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0;">{{phoneNumber}}</td>
      </tr>
      <tr>
        <td style="color: #9CA3AF; padding: 8px 0;">Date & Heure</td>
        <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 8px 0;">{{date}}</td>
      </tr>
      <tr style="border-top: 1px solid #1F2937;">
        <td style="color: #10B981; font-weight: bold; padding: 12px 0 0 0;">Total Réglé</td>
        <td style="color: #10B981; font-weight: 800; font-size: 16px; text-align: right; padding: 12px 0 0 0;">{{amount}} {{currency}}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1F2937;">
    <p style="color: #6B7280; font-size: 12px; margin: 0;">Propulsé par <strong>TUMA Cloud</strong> • Kinshasa, RDC</p>
  </div>
</div>`,
          requiredVariables: ['transactionId', 'amount', 'currency', 'provider', 'customerName', 'phoneNumber', 'date'],
        },
        {
          organizationId: new Types.ObjectId(organizationId),
          name: '🔐 Code OTP & Magic Link Sécurisé',
          slug: 'security-otp',
          subject: '🔑 Votre code de vérification TUMA : {{otpCode}}',
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0F19; color: #F9FAFB; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #10B981; font-size: 22px; font-weight: 800; margin: 0 0 8px 0;">Vérification de Sécurité</h2>
    <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Bonjour {{userName}}, utilisez le code à 6 chiffres ci-dessous pour vous connecter :</p>
  </div>

  <div style="background: #111827; border: 1px solid #10B981; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
    <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #10B981;">{{otpCode}}</span>
    <p style="color: #9CA3AF; font-size: 12px; margin: 12px 0 0 0;">Ce code expire dans <strong>10 minutes</strong>.</p>
  </div>

  <div style="text-align: center; margin: 24px 0;">
    <p style="color: #9CA3AF; font-size: 13px;">Ou connectez-vous directement via ce lien sécurisé :</p>
    <a href="{{magicLinkUrl}}" style="background: linear-gradient(to right, #10B981, #059669); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 8px;">
      Connexion 1-Clic
    </a>
  </div>

  <p style="color: #6B7280; font-size: 11px; text-align: center; margin-top: 30px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
</div>`,
          requiredVariables: ['userName', 'otpCode', 'magicLinkUrl'],
        },
        {
          organizationId: new Types.ObjectId(organizationId),
          name: '🚀 Onboarding & Bienvenue Développeur',
          slug: 'welcome-onboarding',
          subject: '🎉 Bienvenue sur TUMA, {{developerName}} !',
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0B0F19; color: #F9FAFB; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
  <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">Bienvenue sur TUMA 🚀</h1>
  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.6;">Bonjour <strong>{{developerName}}</strong>,</p>
  <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6;">Votre infrastructure pour <strong>{{projectName}}</strong> est désormais prête. Vous disposez de <strong>10,000 emails offerts</strong> par mois et d'une intégration en moins de 5 lignes de code.</p>

  <div style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 16px; margin: 24px 0; font-family: monospace; font-size: 13px; color: #10B981;">
    npm install @tuma/sdk
  </div>

  <div style="margin: 24px 0;">
    <a href="https://tuma.dev/dashboard" style="background: #FF6B00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
      Accéder à la Console
    </a>
  </div>
</div>`,
          requiredVariables: ['developerName', 'projectName'],
        },
      ];

      await this.templateModel.insertMany(defaultTemplates);
      list = await this.templateModel.find({ organizationId }).sort({ createdAt: -1 });
    }

    return list;
  }

  /**
   * Récupère un template par son slug
   */
  async getTemplate(organizationId: string, slug: string): Promise<Template> {
    const tpl = await this.templateModel.findOne({ organizationId, slug });
    if (!tpl) throw new NotFoundException(`Template '${slug}' non trouvé.`);
    return tpl;
  }

  /**
   * Sauvegarde ou met à jour un template
   */
  async saveTemplate(organizationId: string, dto: { name: string; slug: string; subject: string; html: string; requiredVariables?: string[] }): Promise<Template> {
    const text = this.compiler.generatePlainText(dto.html);
    return this.templateModel.findOneAndUpdate(
      { organizationId, slug: dto.slug.toLowerCase().trim() },
      {
        name: dto.name,
        subject: dto.subject,
        html: dto.html,
        text,
        requiredVariables: dto.requiredVariables || [],
      },
      { upsert: true, new: true },
    );
  }

  /**
   * Supprime un template
   */
  async deleteTemplate(organizationId: string, slug: string): Promise<{ deleted: boolean }> {
    await this.templateModel.deleteOne({ organizationId, slug: slug.toLowerCase().trim() });
    return { deleted: true };
  }
}
