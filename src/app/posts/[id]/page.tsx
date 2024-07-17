import serverLogger from "@/internals/serverLogger";

export default function Page({ params }: { params: { id: string } }) {
  serverLogger.setTags({ post_id: params.id });

  return <p>Post: {params.id}</p>;
}
