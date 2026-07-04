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
        onConnect: ({ connectionParams, extra }: any) => {
          extra.connectionParams = connectionParams;
        },
      },
    },
    context: ({ req, extra }) => {
      if (req) return { req };
      const authorization =
        extra?.connectionParams?.authorization ?? extra?.connectionParams?.Authorization;
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
