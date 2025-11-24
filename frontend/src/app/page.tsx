"use client";

import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { GET_MESSAGES } from "@/lib/graphql/queries";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    displayName?: string | null;
  } | null;
}

interface GetMessagesData {
  messages: Message[];
}

export default function Home() {
  const { data, loading, error } = useQuery<GetMessagesData>(GET_MESSAGES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold mb-4">Threads</h1>
        {loading && <p>Loading…</p>}
        {error && <p>Something went wrong.</p>}
        <ul className="space-y-3">
          {data?.messages?.map((msg) => (
            <li key={msg.id} className="border rounded p-3">
              <div className="text-sm text-gray-500">
                {msg.author?.displayName ?? "Anonymous"} ·{" "}
                {new Date(msg.createdAt).toLocaleString()}
              </div>
              <p className="mt-1">{msg.content}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
