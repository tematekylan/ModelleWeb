import Link from "next/link";
import { Search, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TemplateGrid } from "@/components/marketplace/TemplateGrid";
import { getPublishedTemplates, getCategories } from "@/lib/templates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ templates: featured }, { templates: trending }, categories] = await Promise.all([
    getPublishedTemplates({ featured: true, limit: 4 }),
    getPublishedTemplates({ sort: "popular", limit: 8 }),
    getCategories(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Designs modernes 2025-2026
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Modèles de sites web{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                modernes
              </span>{" "}
              pour l&apos;Afrique
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              TemplateHub CM — marketplace francophone avec paiement sécurisé via Paystack.
            </p>
            <form action="/templates" method="GET" className="mt-8 flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="Rechercher un template..." className="pl-10 h-12" />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Rechercher
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Catégories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">
                {cat.icon?.[0]?.toUpperCase() ?? "T"}
              </div>
              <p className="mt-2 text-sm font-medium group-hover:text-primary">{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat._count.templates} templates</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/templates?featured=true">
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6">
          <TemplateGrid templates={featured} />
        </div>
      </section>

      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold">Trending</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/templates?sort=popular">
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6">
            <TemplateGrid templates={trending} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold">Vendez vos templates</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Rejoignez notre communauté de créateurs camerounais. Commission de 25%, paiements locaux pour vos clients.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/register?role=seller">Devenir vendeur</Link>
        </Button>
      </section>
    </div>
  );
}
