"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
  const [latestPosts] = api.post.getPosts.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });
  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
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
