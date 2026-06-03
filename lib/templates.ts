import { Prisma, TemplateStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TemplateListParams = {
  q?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
};

export async function getPublishedTemplates(params: TemplateListParams = {}) {
  const {
    q,
    category,
    featured,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
  } = params;

  const where: Prisma.TemplateWhereInput = {
    status: TemplateStatus.PUBLISHED,
    ...(featured ? { featured: true } : {}),
    ...(category
      ? { category: { slug: category } }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { techStack: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.TemplateOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "popular"
          ? { downloads: "desc" }
          : { createdAt: "desc" };

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        seller: { include: { user: { select: { name: true } } } },
        images: { where: { isPrimary: true }, take: 1 },
        tags: true,
      },
    }),
    prisma.template.count({ where }),
  ]);

  return { templates, total, pages: Math.ceil(total / limit), page };
}

export async function getTemplateBySlug(slug: string) {
  return prisma.template.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: { include: { user: { select: { name: true, avatar: true } } } },
      images: { orderBy: { order: "asc" } },
      files: true,
      tags: true,
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { templates: true } } },
  });
}

export async function incrementTemplateViews(id: string) {
  await prisma.template.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getRelatedTemplates(categoryId: string, excludeId: string, limit = 4) {
  return prisma.template.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      status: TemplateStatus.PUBLISHED,
    },
    take: limit,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
  });
}

export function getEffectivePrice(template: { price: Prisma.Decimal; discountPrice: Prisma.Decimal | null }) {
  return template.discountPrice
    ? Number(template.discountPrice)
    : Number(template.price);
}
