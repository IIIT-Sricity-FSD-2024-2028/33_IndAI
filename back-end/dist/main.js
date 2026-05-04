"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fs = require("fs");
const path = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: true });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('IndAI Review-4 Paper Trading API')
        .setDescription('NestJS modular backend with in-memory arrays, RBAC through x-role header, DTO validation, Swagger and minute-stock data endpoints.')
        .setVersion('1.0')
        .addTag('Users').addTag('Stocks').addTag('Trades').addTag('Watchlists').addTag('Courses').addTag('Assignments').addTag('Sessions').addTag('Notifications')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const docsDir = path.join(process.cwd(), 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'swagger.json'), JSON.stringify(document, null, 2));
    await app.listen(3000);
    console.log('🚀 IndAI backend running at http://localhost:3000/api');
    console.log('📘 Swagger UI: http://localhost:3000/api/docs');
    console.log('🧾 Swagger JSON generated at back-end/docs/swagger.json');
}
bootstrap();
//# sourceMappingURL=main.js.map