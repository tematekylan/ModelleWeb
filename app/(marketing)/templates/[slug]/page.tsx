import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TemplatePreview } from "@/components/marketplace/TemplatePreview";
import { TemplateGrid } from "@/components/marketplace/TemplateGrid";
import { PurchaseButton } from "@/components/marketplace/PurchaseButton";
import {
  getTemplateBySlug,
  getRelatedTemplates,
  incrementTemplateViews,
  getEffectivePrice,
} from "@/lib/templates";
import { formatPrice } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TemplateStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template || template.status !== TemplateStatus.PUBLISHED) {
    return { title: "Template introuvable" };
  }
  return {
    title: template.title,
    description: template.description,
    openGraph: {
      title: template.title,
      description: template.description,
      images: template.images[0]?.imageUrl ? [template.images[0].imageUrl] : [],
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template || template.status !== TemplateStatus.PUBLISHED) {
    notFound();
  }

  await incrementTemplateViews(template.id);

  const session = await auth();
  let owned = false;
  if (session?.user) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        buyerId_templateId: {
          buyerId: session.user.id,
          templateId: template.id,
        },
      },
    });
    owned = !!purchase;
  }

  const price = getEffectivePrice(template);
  const related = await getRelatedTemplates(template.categoryId, template.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>{template.category.name}</Badge>
              {template.featured && <Badge variant="secondary">Featured</Badge>}
              {template.techStack && <Badge variant="outline">{template.techStack}</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{template.title}</h1>
            <p className="mt-2 text-muted-foreground">par {template.seller.user.name}</p>
          </div>

          <TemplatePreview demoUrl={template.demoUrl} title={template.title} />

          {template.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {template.images.map((img) => (
                <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={img.imageUrl}
                    alt={img.altText ?? template.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {template.longDescription ?? template.description}
            </p>
          </div>

          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{formatPrice(price)}</span>
              {template.discountPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(Number(template.price))}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Paiement sécurisé via Paystack (carte, Mobile Money)
            </p>
            <Separator className="my-4" />
            <PurchaseButton
              templateId={template.id}
              slug={template.slug}
              price={price}
              owned={owned}
              isAuthenticated={!!session?.user}
            />
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>✓ Fichiers sources inclus</li>
              <li>✓ Mises à jour gratuites</li>
              <li>✓ Support vendeur</li>
              <li>✓ {template.downloads} téléchargements</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Templates similaires</h2>
          <TemplateGrid templates={related as Parameters<typeof TemplateGrid>[0]["templates"]} />
        </section>
      )}
    </div>
  );
}
