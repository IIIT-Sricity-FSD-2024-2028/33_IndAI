import './load-env';
import { validMediaUrl } from './common/media.util';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

function findFrontendDirectory(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../../../frontend/dist'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  return null;
}



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  app.useBodyParser('json', { limit: '2mb' });
  app.enableCors({ origin: process.env.PUBLIC_URL || 'http://localhost:5173', credentials: true });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Uploaded course/video/PDF content.
  app.use('/uploads', (req:any,res:any,next:any)=>{
    if(!validMediaUrl(req.originalUrl))return res.status(403).json({message:'This lesson link expired. Reopen the course to get a fresh link.'});
    res.setHeader('Cache-Control','private, no-store');next();
  }, express.static(path.join(process.env.DATA_DIR || process.cwd(), 'uploads'), {cacheControl:false}));

  // Serve the existing frontend from the SAME NestJS port. This makes
  // `npm run start:dev` enough to start the complete IndAI website.
  const frontendDir = findFrontendDirectory();
  if (frontendDir) {
    app.use(express.static(frontendDir, { index: 'index.html' }));
    app.use((req:any,res:any,next:any)=>{if(req.method==='GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads'))return res.sendFile(path.join(frontendDir,'index.html'));next();});
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('IndAI Review-4 Paper Trading API')
    .setDescription(
      'NestJS modular backend with signed JWT authentication, refresh-token rotation, role-based access control, DTO validation, Razorpay and minute-stock data endpoints.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Paste the access token returned by POST /api/auth/login.' },
      'JWT',
    )
    .addTag('Auth')
    .addTag('Payments / Razorpay')
    .addTag('Users')
    .addTag('Stocks')
    .addTag('Trades')
    .addTag('Watchlists')
    .addTag('Courses')
    .addTag('Assignments')
    .addTag('Sessions')
    .addTag('Notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const docsDir = path.join(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(
    path.join(docsDir, 'swagger.json'),
    JSON.stringify(document, null, 2),
  );

  const configuredPort = Number(process.env.PORT);
  const port = Number.isInteger(configuredPort) && configuredPort > 0
    ? configuredPort
    : 3000;

  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');

  const baseUrl = `http://localhost:${port}`;

  console.log('');
  console.log('============================================================');
  console.log('                 🚀 IndAI IS RUNNING');
  console.log('============================================================');
  console.log(`🌐 Website       : ${baseUrl}`);
  console.log(`🔐 Login         : ${baseUrl}/pages/login.html`);
  console.log(`📝 Register      : ${baseUrl}/pages/register.html`);
  console.log(`🔌 API Base      : ${baseUrl}/api`);
  console.log(`📘 Swagger UI    : ${baseUrl}/api/docs`);
  console.log('🔑 Authentication : JWT Bearer + HttpOnly refresh cookie');
  console.log(`⏱️  JWT expiry     : access ${process.env.JWT_ACCESS_EXPIRES_IN || '15m'} / refresh ${process.env.JWT_REFRESH_EXPIRES_IN || '7d'}`);
  console.log('============================================================');
  console.log(`📂 Frontend      : ${frontendDir ?? 'NOT FOUND'}`);
  console.log('🧾 Swagger JSON  : back-end/docs/swagger.json');
  console.log('');

  if (!frontendDir) {
    console.warn(
      '⚠️ Frontend folder was not found. Run the backend from the back-end folder inside the complete IndAI project.',
    );
  }
}

bootstrap();
