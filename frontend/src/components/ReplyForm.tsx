"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CREATE_REPLY } from "@/lib/graphql/queries";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";
import { ensureUserSession } from "@/lib/session";

export function ReplyForm({ threadId }: { threadId: string }) {
  const MAX_REPLY_CHARACTERS = 300;
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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        Continue the conversation
      </label>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply…"
        maxLength={MAX_REPLY_CHARACTERS}
        className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white/90 p-3 text-sm text-zinc-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        rows={4}
      />

      <div className="m-2 flex items-center justify-between text-xs text-zinc-500">
        <span>
          {content.length}/{MAX_REPLY_CHARACTERS} characters
        </span>
        {error && (
          <span className="font-semibold text-red-500">
            Error: {error.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-blue-600/40 transition hover:translate-y-0.5 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:opacity-70"
      >
        {loading ? "Sending…" : "Reply"}
      </button>
    </form>
  );
}
