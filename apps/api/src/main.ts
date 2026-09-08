import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TumaBootstrap');
  const app = await NestFactory.create(AppModule);

  // Activation de CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 TUMA API Server en cours d'exécution sur le port http://localhost:${port}`);
}

bootstrap();
