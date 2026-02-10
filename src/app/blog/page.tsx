"use client";

import { trpc } from "@/lib/trpc-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Eye } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const { data, isLoading } = trpc.blog.list.useQuery({ limit: 20 });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-electric-blue" />
          <h1 className="text-3xl font-bold">Blog</h1>
        </div>
        <p className="text-muted-foreground">
          Debate strategies, platform updates, and argumentation tips.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (data?.posts ?? []).length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No blog posts yet. Check back soon!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors h-full">
                {post.og_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.og_image}
                    alt={post.title}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                )}
                <CardContent className={`space-y-2 ${post.og_image ? "pt-3" : "pt-6"}`}>
                  {post.featured && (
                    <Badge variant="outline" className="text-[10px] bg-cyber-green/10 text-cyber-green">
                      Featured
                    </Badge>
                  )}
                  <h2 className="font-semibold text-sm line-clamp-2">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>{post.users.username}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> {post.views}
                      </span>
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {post.blog_post_to_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.blog_post_to_tags.slice(0, 3).map((t) => (
                        <Badge key={t.blog_post_tags.slug} variant="outline" className="text-[9px]">
                          {t.blog_post_tags.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
