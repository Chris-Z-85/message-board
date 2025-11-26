import { gql } from "@apollo/client";

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($threadId: ID!) {
    messageAdded(threadId: $threadId) {
      id
      content
      createdAt
      author {
        id
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