"use client";

import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { GET_MESSAGES } from "@/lib/graphql/queries";

interface Message {
  id: string;
  content: string;
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
      <main>
        <h1>Messages</h1>

        {data?.messages?.length === 0 && <p>No messages yet.</p>}

        <ul>
          {data?.messages?.map((msg) => (
            <li key={msg.id}>{msg.content}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
