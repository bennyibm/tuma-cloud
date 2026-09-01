import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suppression, SuppressionDocument } from '../../schemas/suppression.schema';

@Injectable()
export class SuppressionsService {
  constructor(
    @InjectModel(Suppression.name)
    private readonly suppressionModel: Model<SuppressionDocument>,
  ) {}

  /**
   * Vérifie si une ou plusieurs adresses emails sont bloquées / blacklistées
   */
  async isSuppressed(organizationId: string, email: string): Promise<boolean> {
    const found = await this.suppressionModel.findOne({
      organizationId,
      email: email.toLowerCase().trim(),
    });
    return !!found;
  }

  /**
   * Ajoute une adresse à la liste de suppression (Hard bounce, plainte spam, désinscription)
   */
  async addSuppression(
    organizationId: string,
    email: string,
    reason: 'hard_bounce' | 'spam_complaint' | 'unsubscribe' | 'manual_block' = 'manual_block',
    sourceEmailId?: string,
  ): Promise<Suppression> {
    return this.suppressionModel.findOneAndUpdate(
      { organizationId, email: email.toLowerCase().trim() },
      { reason, sourceEmailId: sourceEmailId || null },
      { upsert: true, new: true },
    );
  }

  /**
   * Liste les adresses supprimées / bloquées d'une organisation
   */
  async listSuppressions(organizationId: string): Promise<Suppression[]> {
    return this.suppressionModel.find({ organizationId }).sort({ createdAt: -1 });
  }

  /**
   * Supprime / débloque une adresse de la liste de suppression
   */
  async removeSuppression(organizationId: string, id: string): Promise<{ deleted: boolean }> {
    const res = await this.suppressionModel.deleteOne({ _id: id, organizationId });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Suppression entry not found.');
    }
    return { deleted: true };
  }
}
