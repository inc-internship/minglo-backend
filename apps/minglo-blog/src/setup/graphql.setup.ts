import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CoreConfig } from '../core/core.config';

export function createGraphQLModuleOptions(config: CoreConfig): ApolloDriverConfig {
  return {
    autoSchemaFile: true,
    path: config.graphqlPath,
    playground: false,
    introspection: config.graphqlIntrospection,
    plugins: config.graphqlSandbox ? [ApolloServerPluginLandingPageLocalDefault()] : [],
    subscriptions: {
      'graphql-ws': {
        onConnect: (ctx: any) => {
          const { connectionParams, extra } = ctx;

          // 1) пробуем взять из connectionParams (если клиент передал явно)
          const fromParams = connectionParams?.authorization ?? connectionParams?.Authorization;

          // 2) иначе берём из сырого HTTP-заголовка upgrade-запроса (так делает Postman Basic Auth)
          const fromHeader = extra?.request?.headers?.authorization;

          extra.connectionParams = {
            authorization: fromParams ?? fromHeader,
          };
        },
      },
    },
    context: ({ req, extra }: any) => {
      // HTTP-запрос (обычные query/mutation)
      if (req) {
        return { req };
      }

      // WebSocket-подключение через graphql-ws
      const connectionParams = extra?.connectionParams ?? {};
      const authorization = connectionParams.authorization ?? connectionParams.Authorization;

      return {
        req: {
          headers: {
            authorization,
          },
        },
      };
    },
  };
}
