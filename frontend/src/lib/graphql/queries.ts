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