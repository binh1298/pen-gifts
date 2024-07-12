import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex justify-between py-4 px-4 w-full">
          <h1 className="font-extrabold tracking-tight sm:text-[2rem]">
            <span className="text-[hsl(280,100%,70%)]">Pen-Gifts</span> App
          </h1>
          <div className="flex gap-4 justify-center items-center">
            <p className="text-xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
            <p className="text-xl text-center text-white">
              {session && <span>{session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="py-3 px-10 font-semibold no-underline rounded-full transition bg-white/10 hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
        {session?.user && <LatestPost />}
      </main>
    </HydrateClient>
  );
}
