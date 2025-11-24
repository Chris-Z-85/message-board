"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apolloClient";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
