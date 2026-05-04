import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const config = new DocumentBuilder()
    .setTitle('IndAI Review-4 Paper Trading API')
    .setDescription('NestJS modular backend with in-memory arrays, RBAC through x-role header, DTO validation, Swagger and minute-stock data endpoints.')
    .setVersion('1.0')
    .addTag('Users').addTag('Stocks').addTag('Trades').addTag('Watchlists').addTag('Courses').addTag('Assignments').addTag('Sessions').addTag('Notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const docsDir = path.join(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive:true });
  fs.writeFileSync(path.join(docsDir, 'swagger.json'), JSON.stringify(document, null, 2));
  await app.listen(3000);
  console.log('🚀 IndAI backend running at http://localhost:3000/api');
  console.log('📘 Swagger UI: http://localhost:3000/api/docs');
  console.log('🧾 Swagger JSON generated at back-end/docs/swagger.json');
}
bootstrap();
