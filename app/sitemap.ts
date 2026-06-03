import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const templates = await prisma.template.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const categories = await prisma.category.findMany({
    select: { slug: true, createdAt: true },
  }).catch(() => []);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/templates`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    ...templates.map((t) => ({
      url: `${baseUrl}/templates/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
