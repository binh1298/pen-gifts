import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return session?.user ? (
    <Link href="/posts">Go To Posts</Link>
  ) : (
    "Please login"
  );
}
