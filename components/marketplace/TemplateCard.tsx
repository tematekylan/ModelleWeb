import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type TemplateWithRelations = Prisma.TemplateGetPayload<{
  include: {
    category: true;
    seller: { include: { user: { select: { name: true } } } };
    images: true;
    tags: true;
  };
}>;

interface TemplateCardProps {
  template: TemplateWithRelations;
}

function getEffectiveTemplatePrice(template: TemplateWithRelations) {
  return template.discountPrice
    ? Number(template.discountPrice)
    : Number(template.price);
}

export function TemplateCard({ template }: TemplateCardProps) {
  const primaryImage = template.images.find((i) => i.isPrimary) ?? template.images[0];
  const price = getEffectiveTemplatePrice(template);
  const originalPrice = template.discountPrice ? Number(template.price) : null;

  return (
    <Link href={`/templates/${template.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 h-full">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText ?? template.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No preview
            </div>
          )}
          {template.featured && (
            <Badge className="absolute top-3 left-3" variant="secondary">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {template.seller.user.name} · {template.category.name}
              </p>
            </div>
          </div>
          {template.techStack && (
            <Badge variant="outline" className="mt-2 text-xs">
              {template.techStack}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {template.downloads} ventes
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
