"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_THREADS } from "@/lib/graphql/queries";

interface Message {
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

interface GetMessagesData {
  messages: Message[];
}

export default function Home() {
  const { data, loading, error } = useQuery<GetMessagesData>(GET_THREADS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const threads = data?.messages.filter((m) => !m.parent);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>Threads:</h1>
        <ul>
          {threads?.map((thread) => (
            <li key={thread.id}>
              <Link href={`/thread/${thread.id}`}>{thread.content}</Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
