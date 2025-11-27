"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_THREADS } from "@/lib/graphql/queries";
import { GetThreadsData } from "@/lib/graphql/types";
import { CreateThreadForm } from "@/components/CreateThreadForm";
import { SlBubbles, SlUser, SlCalender } from "react-icons/sl";

export default function Home() {
  const { data, loading, error, refetch } = useQuery<GetThreadsData>(
    GET_THREADS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const threads = data?.messages ?? [];

  const formatTimestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center text-center">
          <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200">
            The community
          </p>
          <div className="flex items-center gap-4">
            <SlBubbles className="text-3xl font-semibold text-white sm:text-4xl" />
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Message Board
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Start conversations, ask questions, and share updates with everyone.
          </p>
        </header>

        <section>
          <CreateThreadForm onCreated={() => refetch()} />
        </section>

        <main className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Latest threads
              </h2>
              <p className="text-sm text-slate-400">Browse conversations</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {threads.length} active
            </span>
          </div>

          {loading && (
            <p className="mt-6 text-sm text-slate-400">
              Loading conversations…
            </p>
          )}
          {error && (
            <p className="mt-6 text-sm font-medium text-red-400">
              Failed to load threads: {error.message}
            </p>
          )}

          {threads.length === 0 && !loading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
              <p>No threads yet. Be the first to spark a conversation!</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-400/40 hover:bg-white/10"
                >
                  <Link
                    href={`/thread/${thread.id}`}
                    className="block space-y-3"
                  >
                    <p className="text-lg font-medium text-white">
                      {thread.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <SlUser />
                          {thread.author?.displayName ?? "Anonymous"}
                        </span>
                        <span className="opacity-50">•</span>
                        <span className="inline-flex items-center gap-1">
                          <SlCalender />
                          {thread.createdAt
                            ? formatTimestamp.format(new Date(thread.createdAt))
                            : "Just now"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-blue-200">
                        View →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
