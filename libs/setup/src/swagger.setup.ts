import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

type SwaggerConfigOptions = {
  isEnabled: boolean;
  prefix: string;
  title: string;
  description: string;
  version: string;
};

export function swaggerSetup(app: INestApplication, options: SwaggerConfigOptions) {
  const { isEnabled, description, version, title, prefix } = options;

  if (isEnabled) {
    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(prefix, app, document, {
      customSiteTitle: title,
    });
  }
}
