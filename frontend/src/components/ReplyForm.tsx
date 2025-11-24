import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_REPLY } from "@/lib/graphql/queries";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("");
  const [createReply, { loading, error }] = useMutation(CREATE_REPLY, {
    refetchQueries: [
      { query: GET_THREAD_WITH_REPLIES, variables: { id: threadId } },
    ],
  });

  // hardcoded author id for now
  const fakeAuthorId = "cmid01a240000111wjg0by59y";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    await createReply({
      variables: {
        content,
        authorId: fakeAuthorId,
        threadId,
      },
    });

    setContent("");
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
