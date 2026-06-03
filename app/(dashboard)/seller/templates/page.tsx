import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { submitTemplateForReview } from "@/lib/actions";

export default async function SellerTemplatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) redirect("/dashboard");

  const templates = await prisma.template.findMany({
    where: { sellerId: seller.id },
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  async function submitAction(formData: FormData) {
    "use server";
    const templateId = formData.get("templateId") as string;
    await submitTemplateForReview(templateId, seller!.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes templates</h1>
        <Button asChild>
          <Link href="/seller/upload">Nouveau template</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{template.title}</p>
                  <Badge variant="outline">{template.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.category.name} · {formatPrice(Number(template.price))}
                </p>
                {template.rejectionReason && (
                  <p className="text-sm text-destructive mt-1">
                    Rejeté: {template.rejectionReason}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {(template.status === "DRAFT" || template.status === "REJECTED") && (
                  <form action={submitAction}>
                    <input type="hidden" name="templateId" value={template.id} />
                    <Button type="submit" size="sm">
                      Soumettre pour review
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
