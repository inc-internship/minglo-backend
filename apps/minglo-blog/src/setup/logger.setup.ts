import { INestApplication } from '@nestjs/common';
import { LoggerService } from '@app/logger';

export async function loggerSetup(app: INestApplication): Promise<{ logger: LoggerService }> {
  const logger = await app.resolve(LoggerService);
  logger.setContext('NEST_INIT');
  app.useLogger(logger);

  return { logger };
}
