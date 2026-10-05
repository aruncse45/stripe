import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.enableCors({ origin: config.get<string>('FRONTEND_URL') });

  await app.listen(config.get<string>('PORT') ?? 4000);
}

await bootstrap();
