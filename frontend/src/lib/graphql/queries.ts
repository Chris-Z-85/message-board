import { gql } from "@apollo/client";

export const GET_THREADS = gql`
  query GetThreads {
    messages(
      where: { parent: null }
      orderBy: { createdAt: desc }
    ) {
      id
      content
      createdAt
      author {
        displayName
      }
    }
  }
`;

export const GET_THREAD_WITH_REPLIES = gql`
  query GetThreadWithReplies($id: ID!) {
    thread: message(where: { id: $id }) {
      id
      content
      createdAt
      author {
        displayName
      }
    }

    replies: messages(
      where: { rootThread: { id: { equals: $id } } }
      orderBy: { createdAt: asc }
    ) {
      id
      content
      createdAt
      author {
        displayName
      }
      parent {
        id
      }
    }
  }
`;

export const CREATE_THREAD = gql`
  mutation CreateThread($content: String!, $authorId: ID!) {
    createMessage(
      data: {
        content: $content
        author: { connect: { id: $authorId } }
      }
    ) {
      id
      content
      createdAt
      author {
        displayName
      }
    }
  }
`;

export const CREATE_REPLY = gql`
  mutation CreateReply(
    $content: String!
    $authorId: ID!
    $threadId: ID!
  ) {
    createMessage(
      data: {
        content: $content
        author: { connect: { id: $authorId } }
        parent: { connect: { id: $threadId } }
        rootThread: { connect: { id: $threadId } }
      }
    ) {
      id
      content
      createdAt
      author {
        displayName
      }
      parent {
        id
      }
      rootThread {
        id
      }
    }
  }
`;

export const FIND_SESSION_BY_IDENTIFIER = gql`
  query FindSessionByIdentifier($sessionIdentifier: String!) {
    userSessions(
      where: { sessionIdentifier: { equals: $sessionIdentifier } }
      take: 1
    ) {
      id
      displayName
      sessionIdentifier
    }
  }
`;

export const CREATE_USER_SESSION = gql`
  mutation CreateUserSession($sessionIdentifier: String!, $displayName: String) {
    createUserSession(
      data: {
        sessionIdentifier: $sessionIdentifier
        displayName: $displayName
      }
    ) {
      id
      displayName
      sessionIdentifier
    }
  }
`;