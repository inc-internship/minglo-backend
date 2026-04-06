import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SwaggerTitle = 'Minglo Media Service API';
const SWAGGER_PREFIX = 'swagger';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(SwaggerTitle)
      .setDescription(
        `${SwaggerTitle} — service for uploading, storing and managing media files (images) using S3 service.`,
      )
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(SWAGGER_PREFIX, app, document, {
      customSiteTitle: SwaggerTitle,
    });
  }
}
