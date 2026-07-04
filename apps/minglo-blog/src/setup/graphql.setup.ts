import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CoreConfig } from '../core/core.config';

export function createGraphQLModuleOptions(config: CoreConfig): ApolloDriverConfig {
  return {
    autoSchemaFile: true,
    path: config.graphqlPath,
    playground: false,
    introspection: config.graphqlIntrospection,
    plugins: config.graphqlSandbox
      ? [ApolloServerPluginLandingPageLocalDefault({ embed: false })]
      : [],
    subscriptions: {
      'graphql-ws': {
        onConnect: (context: any) => {
          const { connectionParams, extra } = context;
          extra.req = {
            headers: {
              authorization: connectionParams?.authorization ?? connectionParams?.Authorization,
            },
          };
        },
      },
    },
    context: ({ req, extra }) => ({ req: req ?? extra?.req }),
  };
}
