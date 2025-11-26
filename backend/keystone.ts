// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core';

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema';
import { mergeSchemas } from '@graphql-tools/schema';
import { pubsub } from './pubsub';
import { WebSocketServer } from 'ws';
import { useServer as wsUseServer } from 'graphql-ws/use/ws';


// Authentication is optional for this assignment
//   We're using simple session management without requiring authentication
//   The API is open and accessible without login

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',
  },

  server: {
    port: 3000,
    cors: {
      origin: ['http://localhost:3001'],
      credentials: true,
    },

    extendHttpServer: (httpServer, commonContext) => {
      const baseSchema = commonContext.graphql.schema;

      const schemaWithSubscriptions = mergeSchemas({
        schemas: [baseSchema],
        typeDefs: `
          type Subscription {
            messageAdded(threadId: ID!): Message!
          }
        `,
        resolvers: {
          Subscription: {
            messageAdded: {
              subscribe: (_root: unknown, args: { threadId: string }) => {
                const channel = `MESSAGE_ADDED_${args.threadId}`;
                console.log('[Subscription] client subscribed to', channel);
                return (pubsub as any).asyncIterableIterator(channel);
              },
            },
          },
        },
      });

      const wss = new WebSocketServer({
        server: httpServer,
        path: '/api/graphql',
      });



      wsUseServer(
        {
          schema: schemaWithSubscriptions,
          context: async () => commonContext as any,
        },
        wss
      );
    },
  },

  lists,
});
