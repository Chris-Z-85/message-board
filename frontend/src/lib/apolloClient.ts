"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient as createWSClient } from "graphql-ws";

const HTTP_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL ??
  "http://localhost:3000/api/graphql";

const WS_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ??
      "ws://localhost:3000/api/graphql"
    : null;

// Basic HTTP link
const httpLink = new HttpLink({
  uri: HTTP_URL,
});

// Basic error logging link
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach((err) => {
      console.error("[GraphQL error]", err);
    });
  } else {
    console.error("[Network error]", error);
  }
});

// WebSocket link (client-side only)
const wsLink =
  typeof window !== "undefined" && WS_URL
    ? new GraphQLWsLink(
        createWSClient({
          url: WS_URL,
          // simple, enough for assignment
          retryAttempts: 5,
          lazy: true,
        })
      )
    : null;

// Route queries/mutations to HTTP, subscriptions to WS
const splitLink =
  typeof window !== "undefined" && wsLink
    ? ApolloLink.split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        errorLink.concat(httpLink)
      )
    : errorLink.concat(httpLink);

// Apollo client singleton (client-side only)
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
