"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading, error } = trpc.blog.bySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center space-y-4">
        <p className="text-muted-foreground">Post not found.</p>
        <Link href="/blog" className="text-sm text-electric-blue hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {post.users.username}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />{" "}
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Draft"}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {post.views} views
          </span>
        </div>

        {/* Categories and tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.blog_post_to_categories.map((c) => (
            <Badge key={c.blog_post_categories.slug} className="text-[10px]">
              {c.blog_post_categories.name}
            </Badge>
          ))}
          {post.blog_post_to_tags.map((t) => (
            <Badge key={t.blog_post_tags.slug} variant="outline" className="text-[10px]">
              {t.blog_post_tags.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured image */}
      {(post.media_library?.url || post.og_image) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media_library?.url ?? post.og_image ?? ""}
          alt={post.media_library?.alt ?? post.title}
          className="w-full rounded-xl object-cover max-h-96"
        />
      )}

      {/* Content */}
      <div
        className="prose prose-invert max-w-none prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-electric-blue prose-strong:text-foreground"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
