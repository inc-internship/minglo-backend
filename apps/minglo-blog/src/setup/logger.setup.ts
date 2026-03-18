import { INestApplication } from '@nestjs/common';
import { ContextLogger } from '@app/logger';

export async function loggerSetup(app: INestApplication) {
  const logger = await app.resolve(ContextLogger);
  logger.setContext('NEST_INITIALIZED');
  app.useLogger(logger);
}
