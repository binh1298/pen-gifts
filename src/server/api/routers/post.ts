import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      const call = async () => {
        // simulate a slow db call
        await new Promise((resolve) => setTimeout(resolve, 3000));

        throw new Error("ERROR DURING CREATE POST");
        await ctx.db.insert(posts).values({
          name: input.name,
          description: input.description,
          createdById: ctx.session.user.id,
        });
      };

      console.log("fm calling create post");
      return call();
      // const { time, error, result } = await serverLogger.logPerformance(
      //   "create post",
      //   call(),
      // );
      // console.log("fm time", time, error, result);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      throw new Error("ERROR NE ANH EM qweqwe");
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }),

  getPosts: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.posts.findMany();
  }),

  getPostDetails: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.posts.findFirst({
        where: (post, { eq }) => eq(post.id, input.id),
      });
    }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
