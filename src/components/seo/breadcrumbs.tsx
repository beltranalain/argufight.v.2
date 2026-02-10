"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { StructuredData } from "./structured-data";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://argufight.com",
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `https://argufight.com${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
