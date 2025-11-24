"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CREATE_REPLY } from "@/lib/graphql/queries";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";
import { ensureUserSession } from "@/lib/session";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("");
  const client = useApolloClient();
  const [createReply, { loading, error }] = useMutation(CREATE_REPLY, {
    refetchQueries: [
      { query: GET_THREAD_WITH_REPLIES, variables: { id: threadId } },
    ],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // Get or create user session to get authorId
      const session = await ensureUserSession(client);

      await createReply({
        variables: {
          content: content.trim(),
          authorId: session.id,
          threadId,
        },
      });

      setContent("");
    } catch (err) {
      // Error is already handled by the error state from useMutation
      // This catch prevents unhandled promise rejection warnings
      console.error("Failed to create reply:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply…"
        className="border rounded p-2"
      />
      {error && (
        <p className="text-sm text-red-500">
          Error posting reply: {error.message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="self-start px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
