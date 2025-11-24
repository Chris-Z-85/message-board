"use client";

import { v4 as uuid } from "uuid";
import { useApolloClient } from "@apollo/client/react";
import {
  FIND_SESSION_BY_IDENTIFIER,
  CREATE_USER_SESSION,
} from "./graphql/queries";
import {
  FindSessionByIdentifierData,
  CreateUserSessionData,
} from "./graphql/types"; 

const SESSION_KEY = "messageBoardSessionIdentifier";

export async function ensureUserSession(
  client: ReturnType<typeof useApolloClient>
): Promise<{ id: string; displayName?: string | null }> {
  // 1) Get or create local sessionIdentifier
  let sessionIdentifier =
    typeof window !== "undefined"
      ? window.localStorage.getItem(SESSION_KEY)
      : null;

  if (!sessionIdentifier) {
    sessionIdentifier = uuid();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, sessionIdentifier);
    }
  }

  // 2) Try to find existing UserSession
  const { data } = await client.query<FindSessionByIdentifierData>({
    query: FIND_SESSION_BY_IDENTIFIER,
    variables: { sessionIdentifier },
    fetchPolicy: "network-only",
  });

  const existing = data?.userSessions?.[0];
  if (existing) {
    return { id: existing.id, displayName: existing.displayName };
  }

  // 3) Create new UserSession
  const displayName = `User-${sessionIdentifier.slice(0, 5)}`;
  const res = await client.mutate<CreateUserSessionData>({
    mutation: CREATE_USER_SESSION,
    variables: { sessionIdentifier, displayName },
  });

  const created = res.data?.createUserSession;
  if (!created) {
    throw new Error("Failed to create user session");
  }
  return { id: created.id, displayName: created.displayName };
}
