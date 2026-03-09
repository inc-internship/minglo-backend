import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { initAppModule } from '../../src/init-app-module';
import { UserTestManager } from '../managers/user-test.manager';
import { UserTestDtoManager } from '../managers/user-test.dto-manager';

export const initTestSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();

  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  });

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  await app.init();

  const userTestManger = new UserTestManager(app);
  const userTestDtoManager = new UserTestDtoManager(app);

  const httpServer = app.getHttpServer();

  return {
    app,
    httpServer,
    userTestManger,
    userTestDtoManager,
  };
};
