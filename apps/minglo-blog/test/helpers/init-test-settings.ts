import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { initAppModule } from '../../src/init-app-module';
import { appSetup } from '../../src/setup/app.setup';
import { EmailService } from '@app/notifications';
import { AuthTestManager } from '../managers';

export const initTestSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  });

  testingModuleBuilder.overrideProvider(EmailService).useValue({
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordRecoveryEmail: jest.fn().mockResolvedValue(undefined),
  });

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  appSetup(app, false);

  await app.init();

  const authTestManager = new AuthTestManager(app);

  const httpServer = app.getHttpServer();

  return {
    app,
    httpServer,
    authTestManager,
  };
};
