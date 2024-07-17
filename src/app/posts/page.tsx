"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";

import { api } from "@/trpc/react";
import { useLogger } from "@/internals/LoggerProvider";
import Link from "next/link";

export default function LatestPost() {
  const logger = useLogger();
  const [latestPosts] = api.post.getPosts.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
      setDescription("");
    },
    onError: (error) => {
      logger.error(error);
      throw new Error("CCCKCJAHSKDJAWD");
    },
  });
  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });
  console.log("Server call", deletePost.error);
  if (deletePost.error) {
    console.log("deletePost.error", deletePost.error);
    logger.error(
      new Error("678123498712349817234981723491827419287341298347987"),
    );
    Sentry.captureException(new Error("123"));
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name, description });
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="py-2 px-4 w-full text-black rounded-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="py-2 px-4 w-full text-black rounded-full"
        />
        <button
          type="submit"
          className="py-3 px-10 font-semibold rounded-full transition bg-white/10 hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
      {latestPosts ? (
        <div>
          <p className="truncate">Your most recent gifts:</p>
          {latestPosts.map((post) => (
            <div key={post.id} className="flex gap-2 items-center">
              <p className="truncate">
                [{post.id}] {post.name}
              </p>
              <Link href={`/posts/${post.id}`}>View</Link>
              <button
                onClick={() => {
                  deletePost.mutate({ id: post.id });
                }}
                className="p-1 rounded-full transition bg-white/10 hover:bg-white/20"
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no posts yet.</p>
      )}
    </div>
  );
}
