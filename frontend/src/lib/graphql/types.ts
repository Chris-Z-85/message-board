export interface Message {
  id: string;
  content: string;
  createdAt: string;
  parent?: {
    id: string;
  } | null;
  author?: {
    displayName?: string | null;
  } | null;
}

export interface GetThreadsData {
  messages: Message[];
}

export interface GetThreadWithRepliesData {
  thread: Message | null;
  replies: Message[];
}

export interface CreateThreadData {
  createMessage: Message;
}

export interface UserSession {
  id: string;
  displayName?: string | null;
  sessionIdentifier: string;
}

export interface FindSessionByIdentifierData {
  userSessions: UserSession[];
}

export interface CreateUserSessionData {
  createUserSession: UserSession;
}

