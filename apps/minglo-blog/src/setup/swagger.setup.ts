import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SwaggerTitle = 'Minglo API';
const SWAGGER_PREFIX = 'api/v1';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle(SwaggerTitle)
      .setDescription(
        `${SwaggerTitle} — backend service for a social media platform inspired by Instagram.`,
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(SWAGGER_PREFIX, app, document, {
      customSiteTitle: SwaggerTitle,
    });
  }
}
