import { ConfigModule } from '@nestjs/config';

export enum Environments {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

const getEnvFilePath = (env: Environments) => {
  if (env === Environments.TEST) {
    return ['env/.env.test.local', 'env/.env.test'];
  }

  if (env === Environments.PRODUCTION) {
    return ['env/.env.production'];
  }

  // development — сначала .local (переопределяет base), потом base
  return ['env/.env.development.local', 'env/.env.development'];
};

// you must import this const in the head of your app.module.ts
export const nestDynamicConfigModule = ConfigModule.forRoot({
  ignoreEnvFile:
    process.env.NODE_ENV !== Environments.DEVELOPMENT && process.env.NODE_ENV !== Environments.TEST,
  envFilePath: getEnvFilePath(process.env.NODE_ENV as Environments),
  isGlobal: true,
});
