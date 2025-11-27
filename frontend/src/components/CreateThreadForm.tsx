"use client";

import { FormEvent, useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { CREATE_THREAD, GET_THREADS } from "@/lib/graphql/queries";
import { CreateThreadData } from "@/lib/graphql/types";
import { ensureUserSession } from "@/lib/session";

type CreateThreadFormProps = {
  onCreated?: () => void; // Refetch thread list after submit
};

export function CreateThreadForm({ onCreated }: CreateThreadFormProps) {
  const MAX_CHARACTERS = 500;
  const [content, setContent] = useState("");
  const client = useApolloClient();
  const [createThread, { loading, error }] = useMutation<CreateThreadData>(
    CREATE_THREAD,
    {
      // Refetch threads query to update the list after creating a new thread
      refetchQueries: [{ query: GET_THREADS }],
      onCompleted: () => {
        setContent("");
        onCreated?.();
      },
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      // Get or create user session to get authorId
      const session = await ensureUserSession(client);

      await createThread({
        variables: {
          content: content.trim(),
          authorId: session.id,
        },
      });
    } catch (err) {
      // Error is already handled by the error state from useMutation
      // This catch prevents unhandled promise rejection warnings
      console.error("Failed to create thread:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Start a new thread
        </label>
      </div>

      <textarea
        className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white/90 p-3 text-sm text-zinc-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        rows={4}
        maxLength={MAX_CHARACTERS}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a question or thought..."
        disabled={loading}
      />

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">
          Failed to post thread. Please try again.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {content.length}/{MAX_CHARACTERS}
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-blue-600/40 transition hover:translate-y-0.5 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:opacity-70"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
