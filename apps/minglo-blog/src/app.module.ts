import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { MingloTestModule } from './modules/testing/testing.module';
import { MingloTestController } from './modules/testing/api/testing.controller';
import { ExceptionsModule } from '@app/exceptions';
import { UserAccountModule } from './modules/user-account/user-account.module';
import { AsyncLocalStorageService, LoggerModule, RequestContextMiddleware } from '@app/logger';
import { ScheduleModule } from '@nestjs/schedule';
import { PostsModule } from './modules/posts/posts.module';
import { BillingModule } from './modules/billing/billing.module';
import { ProfileModule } from './modules/profile/profile.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FollowsModule } from './modules/follows/follows.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { AdminModule } from './modules/admin/admin.module';
import { GraphQLModule } from '@nestjs/graphql';
import { createGraphQLModuleOptions } from './setup/graphql.setup';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PubSubModule } from './core/pubsub.module';

@Module({
  imports: [
    DynamicConfigModule,
    CoreModule,
    LoggerModule.forRoot('MINGLO-BLOG'),
    ExceptionsModule,
    UserAccountModule,
    ScheduleModule.forRoot(),
    PostsModule,
    ProfileModule,
    BillingModule,
    NotificationsModule,
    FollowsModule,
    CommentsModule,
    LikesModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [CoreConfig],
      useFactory: (config: CoreConfig) => createGraphQLModuleOptions(config),
    }),
    PubSubModule,
    AdminModule,
  ],
  controllers: [],
  providers: [AsyncLocalStorageService],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }

  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(coreConfig.testingModule ? [MingloTestModule] : [])],
      controllers: [...(coreConfig.testingModule ? [MingloTestController] : [])],
    };
  }
}
