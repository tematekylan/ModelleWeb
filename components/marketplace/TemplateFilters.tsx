"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  slug: string;
};

interface TemplateFiltersProps {
  categories: Category[];
}

export function TemplateFilters({ categories }: TemplateFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/templates?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => router.push("/templates");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filtres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={searchParams.get("category") ?? "all"}
            onValueChange={(v) => updateParams("category", v === "all" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prix min ($)</Label>
          <Input
            type="number"
            min={0}
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(e) => updateParams("minPrice", e.target.value || null)}
          />
        </div>

        <div className="space-y-2">
          <Label>Prix max ($)</Label>
          <Input
            type="number"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(e) => updateParams("maxPrice", e.target.value || null)}
          />
        </div>

        <div className="space-y-2">
          <Label>Trier par</Label>
          <Select
            value={searchParams.get("sort") ?? "newest"}
            onValueChange={(v) => updateParams("sort", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="popular">Populaires</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Réinitialiser
        </Button>
      </CardContent>
    </Card>
  );
}
