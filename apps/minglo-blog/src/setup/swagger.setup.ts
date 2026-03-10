import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from '@app/setup';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Minglo API')
      .setDescription(
        'Minglo API — backend service for a social media platform inspired by Instagram.',
      )
      .setVersion('1.0')
      .addServer('/v1')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
      customSiteTitle: 'Minglo Swagger',
    });
  }
}
