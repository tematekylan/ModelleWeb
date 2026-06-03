import { Suspense } from "react";
import { TemplateGrid } from "@/components/marketplace/TemplateGrid";
import { TemplateFilters } from "@/components/marketplace/TemplateFilters";
import { getPublishedTemplates, getCategories } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    featured?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "popular";
    page?: string;
  }>;
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const [{ templates, total, pages }, categories] = await Promise.all([
    getPublishedTemplates({
      q: params.q,
      category: params.category,
      featured: params.featured === "true",
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      sort: params.sort,
      page,
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="mt-2 text-muted-foreground">
          {total} modèles disponibles
          {params.q ? ` pour « ${params.q} »` : ""}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
          <TemplateFilters categories={categories} />
        </Suspense>

        <div>
          <TemplateGrid templates={templates} />

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={{
                      pathname: "/templates",
                      query: { ...params, page: p.toString() },
                    }}
                  >
                    {p}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
