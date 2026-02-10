"use client";

import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  PUBLISHED: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default function AdminBlogPage() {
  const { data: posts, isLoading } = trpc.admin.blogPosts.useQuery();

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium line-clamp-1 max-w-[300px]">{String(row.title)}</span>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground font-mono">{String(row.slug)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${statusColors[String(row.status)] ?? ""}`}>
          {String(row.status)}
        </Badge>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs">{row.featured ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "views",
      header: "Views",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.views)}</span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.created_at as string), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Blog Management</h1>
      </div>

      <DataTable
        columns={columns}
        data={(posts ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No blog posts found."
      />
    </div>
  );
}
