"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_THREAD, GET_THREADS } from "@/lib/graphql/queries";
import { CreateThreadData } from "@/lib/graphql/types";

type CreateThreadFormProps = {
  onCreated?: () => void; // e.g. refetch thread list after submit
};

export function CreateThreadForm({ onCreated }: CreateThreadFormProps) {
  const [content, setContent] = useState("");
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
      await createThread({
        variables: { content: content.trim() },
      });
    } catch (err) {
      // Error is already handled by the error state from useMutation
      // This catch prevents unhandled promise rejection warnings
      console.error("Failed to create thread:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium">
        New thread
        <textarea
          className="mt-1 block w-full border rounded p-2 text-sm"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          disabled={loading}
        />
      </label>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
      >
        {loading ? "Posting…" : "Post thread"}
      </button>

      {error && (
        <p className="text-xs text-red-600">
          Failed to post thread. Please try again.
        </p>
      )}
    </form>
  );
}
