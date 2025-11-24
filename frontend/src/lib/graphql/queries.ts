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
  mutation CreateThread($content: String!) {
    createMessage(data: { content: $content }) {
      id
      content
      createdAt
      author {
        displayName
      }
    }
  }
`;