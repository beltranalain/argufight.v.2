import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../init";

export const blogRouter = createTRPCRouter({
  // List published blog posts
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(12),
        featured: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.blog_posts.findMany({
        where: {
          status: "PUBLISHED",
          ...(input.featured !== undefined ? { featured: input.featured } : {}),
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          og_image: true,
          featured: true,
          views: true,
          published_at: true,
          created_at: true,
          users: { select: { username: true, avatar_url: true } },
          blog_post_to_categories: {
            include: { blog_post_categories: { select: { name: true, slug: true } } },
          },
          blog_post_to_tags: {
            include: { blog_post_tags: { select: { name: true, slug: true } } },
          },
        },
        orderBy: { published_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        const next = posts.pop();
        nextCursor = next?.id;
      }

      return { posts, nextCursor };
    }),

  // Get single blog post by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.blog_posts.findUnique({
        where: { slug: input.slug },
        include: {
          users: { select: { username: true, avatar_url: true } },
          blog_post_to_categories: {
            include: { blog_post_categories: { select: { name: true, slug: true } } },
          },
          blog_post_to_tags: {
            include: { blog_post_tags: { select: { name: true, slug: true } } },
          },
          media_library: { select: { url: true, alt: true } },
        },
      });

      if (!post || post.status !== "PUBLISHED") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Increment view count
      await ctx.prisma.blog_posts.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });

      return post;
    }),
});
