import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/emails/emails.module';
import { QueuesModule } from './modules/queues/queues.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { SuppressionsModule } from './modules/suppressions/suppressions.module';
import { TransportersModule } from './modules/transporters/transporters.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { DomainsModule } from './modules/domains/domains.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    // Configuration globale des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // Connexion MongoDB (Supporte MONGODB_URI et MONGO_URI)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/tuma_db',
      }),
      inject: [ConfigService],
    }),

    // Connexion Redis / BullMQ (Supporte REDIS_URL, UPSTASH_REDIS_URL, REDIS_TOKEN, REDIS_PASSWORD, TLS)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const rawUrl =
          configService.get<string>('REDIS_URL') ||
          configService.get<string>('UPSTASH_REDIS_URL') ||
          configService.get<string>('UPSTASH_REDIS_REST_URL');

        const token =
          configService.get<string>('REDIS_PASSWORD') ||
          configService.get<string>('REDIS_TOKEN') ||
          configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

        let host = configService.get<string>('REDIS_HOST', 'localhost');
        let port = Number(configService.get<number>('REDIS_PORT', 6379));
        let password = token;
        let isTls = configService.get<string>('REDIS_TLS') === 'true';

        if (rawUrl) {
          try {
            const parsed = new URL(rawUrl);
            host = parsed.hostname || host;
            if (parsed.port) {
              port = Number(parsed.port);
            }
            if (parsed.password) {
              password = decodeURIComponent(parsed.password);
            }
            if (parsed.protocol === 'rediss:') {
              isTls = true;
            }
          } catch {
            // format brut non-URL ignoré
          }
        }

        if (host.includes('upstash.io') || host.includes('rediss://')) {
          isTls = true;
        }

        return {
          connection: {
            host,
            port,
            ...(password ? { password } : {}),
            ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
            maxRetriesPerRequest: null,
          },
        };
      },
      inject: [ConfigService],
    }),

    // Modules Métier
    AuthModule,
    EmailsModule,
    QueuesModule,
    TemplatesModule,
    SuppressionsModule,
    TransportersModule,
    TrackingModule,
    DomainsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
