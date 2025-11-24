"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    displayName?: string | null;
  } | null;
  parent?: {
    id: string;
  } | null;
}

interface GetThreadWithRepliesData {
  thread: Message | null;
  replies: Message[];
}

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<GetThreadWithRepliesData>(
    GET_THREAD_WITH_REPLIES,
    {
      variables: { id: params.id },
    }
  );

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.thread) return <p>Thread not found</p>;

  const thread = data.thread;
  const replies = data.replies.filter((m) => m.id !== thread.id);

  return (
    <div>
      <h1>Thread:</h1>
      <article>
        <p>{thread.content}</p>
        <small>{thread.author?.displayName ?? "Anonymous"}</small>
      </article>

      <h2>Replies</h2>
      <ul>
        {replies.map((reply) => (
          <li key={reply.id}>
            <p>{reply.content}</p>
            <small>{reply.author?.displayName ?? "Anonymous"}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
