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

    // Connexion MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/tuma_db'),
      }),
      inject: [ConfigService],
    }),

    // Connexion Redis / BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
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
