"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  searchPlaceholder = "Search...",
  onSearch,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  onRowClick,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground ${col.className ?? ""}`}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {col.header}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-border/20 last:border-0 transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-muted/30" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
