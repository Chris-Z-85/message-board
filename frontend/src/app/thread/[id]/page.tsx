"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_THREAD_WITH_REPLIES } from "@/lib/graphql/queries";
import { GetThreadWithRepliesData, Message } from "@/lib/graphql/types";
import { MESSAGE_ADDED_SUBSCRIPTION } from "@/lib/graphql/subscriptions";
import { ReplyForm } from "@/components/ReplyForm";

type MessageAddedSubscriptionData = {
  messageAdded: Message;
};

export default function ThreadPage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error, subscribeToMore } =
    useQuery<GetThreadWithRepliesData>(GET_THREAD_WITH_REPLIES, {
      variables: { id: params.id },
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

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.thread) return <p>Thread not found</p>;

  const thread = data.thread;
  // Filter out the thread itself from replies (in case it appears in the replies array)
  const replies = data.replies.filter((m) => m.id !== thread.id);

  return (
    <div>
      <h1>Thread:</h1>
      <article>
        <p>{thread.content}</p>
        <small>{thread.author?.displayName ?? "Anonymous"}</small>
      </article>

      <h2>Replies</h2>
      {replies.length === 0 ? (
        <p className="text-gray-500 mt-4">
          No replies yet. Be the first to reply!
        </p>
      ) : (
        <ul>
          {replies.map((reply) => (
            <li key={reply.id}>
              <p>{reply.content}</p>
              <small>{reply.author?.displayName ?? "Anonymous"}</small>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <h3>Add a Reply</h3>
        <ReplyForm threadId={params.id} />
      </div>
    </div>
  );
}
