import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { initAppModule } from '../../src/init-app-module';
import { appSetup } from '../../src/setup/app.setup';
import { EmailService } from '@app/notifications';
import { AuthTestManager } from '../managers';
import { EmailServiceMock } from '../mocks';

export const initTestSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

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
