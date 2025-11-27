"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";
import { GetThreadWithRepliesData, Message } from "@/lib/graphql/types";
import { MESSAGE_ADDED_SUBSCRIPTION } from "@/lib/graphql/subscriptions";
import { ReplyForm } from "@/components/ReplyForm";
import { SlUser, SlCalender } from "react-icons/sl";

type MessageAddedSubscriptionData = {
  messageAdded: Message;
};

export default function ThreadPage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error, subscribeToMore } =
    useQuery<GetThreadWithRepliesData>(GET_THREAD_WITH_REPLIES, {
      variables: { id: params.id },
      fetchPolicy: "cache-and-network",
    });

  // Real-time subscription: listen for new messages in this thread
  useEffect(() => {
    if (!data?.thread?.id) return;

    const threadId = data.thread.id;

    const unsubscribe = subscribeToMore<MessageAddedSubscriptionData>({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: { threadId },
      updateQuery: (prev, { subscriptionData }) => {
        const currentData = prev as GetThreadWithRepliesData;
        const newMessage = subscriptionData?.data?.messageAdded;
        if (!newMessage) return currentData;

        const prevReplies = currentData.replies ?? [];

        if (
          prevReplies.some((m) => m?.id === newMessage.id) ||
          currentData.thread?.id === newMessage.id
        ) {
          return currentData;
        }

        return {
          ...currentData,
          replies: [...prevReplies, newMessage],
        };
      },
    });

    return () => unsubscribe();
  }, [data?.thread?.id, subscribeToMore]);

  const thread = data?.thread ?? null;
  const replies = thread
    ? (data?.replies ?? []).filter((m) => m.id !== thread.id)
    : [];

  const timestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  let stateMessage: string | null = null;
  if (loading) stateMessage = "Loading thread…";
  else if (error) stateMessage = `Error: ${error.message}`;
  else if (!thread) stateMessage = "Thread not found.";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-blue-200 transition hover:text-white"
        >
          ← Back to threads
        </Link>

        {stateMessage ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
            {stateMessage}
          </div>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-blue-900/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Original Post
              </p>
              <h1 className="mt-4 text-2xl font-semibold text-white">
                {thread?.content}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <SlUser />
                  {thread?.author?.displayName ?? "Anonymous"}
                </span>
                <span className="opacity-50">•</span>
                <span className="inline-flex items-center gap-1">
                  <SlCalender />
                  {thread?.createdAt
                    ? timestampFormatter.format(new Date(thread.createdAt))
                    : "Just now"}
                </span>
              </div>
            </section>

            <section className="mt-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Replies</h2>
                  <p className="text-sm text-slate-400">
                    Join the conversation in real time.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {replies.length} total
                </span>
              </div>

              {replies.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
                  No replies yet. Be the first to respond!
                </div>
              ) : (
                <ul className="space-y-4">
                  {replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-base text-white">{reply.content}</p>
                      <div className="inline-flex items-center gap-1 mt-3 text-xs text-slate-400">
                        <SlUser /> {reply.author?.displayName ?? "Anonymous"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10">
              <ReplyForm threadId={params.id} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
