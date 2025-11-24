"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_THREADS } from "@/lib/graphql/queries";
import { GetThreadsData } from "@/lib/graphql/types";
import { CreateThreadForm } from "@/components/CreateThreadForm";

export default function Home() {
  const { data, loading, error, refetch } =
    useQuery<GetThreadsData>(GET_THREADS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const threads = data?.messages ?? [];

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CreateThreadForm onCreated={() => refetch()} />
      <main>
        <h1>Threads:</h1>
        {threads.length === 0 ? (
          <p className="text-gray-500 mt-4">
            No threads yet. Be the first to post!
          </p>
        ) : (
          <ul>
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link href={`/thread/${thread.id}`}>{thread.content}</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
