import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { Domain, DomainDocument } from '../../schemas/domain.schema';
import { CreateDomainDto } from './dto/create-domain.dto';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);
  private readonly masterKey: Buffer;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Domain.name) private readonly domainModel: Model<DomainDocument>,
  ) {
    const rawKey = this.configService.get<string>(
      'MASTER_ENCRYPTION_KEY',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    );
    this.masterKey = Buffer.from(rawKey.substring(0, 64), 'hex');
  }

  /**
   * Chiffre une chaîne avec AES-256-GCM
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Crée un nouveau domaine avec génération des clés cryptographiques DKIM RSA 2048
   */
  async createDomain(organizationId: string, dto: CreateDomainDto): Promise<Domain> {
    const normalizedName = dto.name.toLowerCase().trim();

    const existing = await this.domainModel.findOne({ organizationId, name: normalizedName });
    if (existing) {
      throw new ConflictException(`The domain '${normalizedName}' is already registered in your organization.`);
    }

    // 1. Génération de la paire de clés RSA 2048 bits
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Nettoyage de la clé publique pour le format d'enregistrement DNS TXT
    const cleanPublicKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/[\r\n\s]/g, '');

    const selector = 'tuma';
    const encryptedPrivateKey = this.encrypt(privateKey);

    // 2. Construction des enregistrements DNS requis
    const dkimHost = `${selector}._domainkey.${normalizedName}`;
    const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;

    const spfHost = `bounces.${normalizedName}`;
    const spfValue = `feedback.tuma.dev`;

    const dmarcHost = `_dmarc.${normalizedName}`;
    const dmarcValue = `v=DMARC1; p=none; rua=mailto:dmarc-reports@tuma.dev`;

    const domain = await this.domainModel.create({
      organizationId,
      name: normalizedName,
      status: 'pending',
      dkim: {
        selector,
        publicKey: cleanPublicKey,
        privateKeyEncrypted: encryptedPrivateKey,
        host: dkimHost,
        value: dkimValue,
        status: 'pending',
      },
      spf: {
        host: spfHost,
        value: spfValue,
        status: 'pending',
      },
      dmarc: {
        host: dmarcHost,
        value: dmarcValue,
        status: 'pending',
      },
    });

    this.logger.log(`Domaine '${normalizedName}' créé avec succès pour l'organisation ${organizationId}`);
    return domain;
  }

  /**
   * Vérifie la configuration DNS réelle d'un domaine
   */
  async verifyDomain(organizationId: string, domainId: string): Promise<Domain> {
    const domain = await this.domainModel.findOne({ _id: domainId, organizationId });
    if (!domain) {
      throw new NotFoundException('Domain not found.');
    }

    let dkimValid = false;
    let spfValid = false;
    let dmarcValid = false;

    // En environnement de développement / local, on offre un bypass de validation instantané
    if (this.configService.get('NODE_ENV') === 'development' || domain.name.endsWith('.local') || domain.name.endsWith('.dev')) {
      dkimValid = true;
      spfValid = true;
      dmarcValid = true;
    } else {
      // 1. Vérification DKIM (TXT)
      try {
        const txtRecords = await dns.promises.resolveTxt(domain.dkim.host);
        const flatTxt = txtRecords.map((chunk) => chunk.join('')).join('');
        if (flatTxt.includes(domain.dkim.publicKey)) {
          dkimValid = true;
        }
      } catch (err) {
        this.logger.warn(`Échec de résolution DNS DKIM pour ${domain.dkim.host}: ${err.message}`);
      }

      // 2. Vérification SPF / Return-Path (CNAME)
      try {
        const cnameRecords = await dns.promises.resolveCname(domain.spf.host);
        if (cnameRecords.some((val) => val.includes('feedback.tuma.dev') || val.includes(domain.spf.value))) {
          spfValid = true;
        }
      } catch (err) {
        this.logger.warn(`Échec de résolution DNS SPF pour ${domain.spf.host}: ${err.message}`);
      }

      // 3. Vérification DMARC (TXT)
      try {
        const dmarcTxt = await dns.promises.resolveTxt(domain.dmarc.host);
        if (dmarcTxt.length > 0) {
          dmarcValid = true;
        }
      } catch (err) {
        this.logger.warn(`Échec de résolution DNS DMARC pour ${domain.dmarc.host}: ${err.message}`);
      }
    }

    domain.dkim.status = dkimValid ? 'verified' : 'failed';
    domain.spf.status = spfValid ? 'verified' : 'failed';
    domain.dmarc.status = dmarcValid ? 'verified' : 'failed';

    const allVerified = dkimValid && spfValid;
    domain.status = allVerified ? 'verified' : 'failed';
    if (allVerified) {
      domain.verifiedAt = new Date();
    }

    await domain.save();
    return domain;
  }

  /**
   * Liste les domaines d'une organisation
   */
  async listDomains(organizationId: string): Promise<Domain[]> {
    return this.domainModel.find({ organizationId }).sort({ createdAt: -1 });
  }

  /**
   * Récupère un domaine par son ID
   */
  async getDomain(organizationId: string, domainId: string): Promise<Domain> {
    const domain = await this.domainModel.findOne({ _id: domainId, organizationId });
    if (!domain) {
      throw new NotFoundException('Domain not found.');
    }
    return domain;
  }

  /**
   * Supprime un domaine
   */
  async deleteDomain(organizationId: string, domainId: string): Promise<{ deleted: boolean }> {
    const res = await this.domainModel.deleteOne({ _id: domainId, organizationId });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Domain not found.');
    }
    return { deleted: true };
  }
}
