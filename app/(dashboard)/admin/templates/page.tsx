import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { approveTemplate, rejectTemplate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function AdminTemplatesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const pending = await prisma.template.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      seller: { include: { user: true } },
      category: true,
      images: { take: 1 },
    },
    orderBy: { updatedAt: "asc" },
  });

  async function approveAction(formData: FormData) {
    "use server";
    await approveTemplate(formData.get("templateId") as string);
  }

  async function rejectAction(formData: FormData) {
    "use server";
    const templateId = formData.get("templateId") as string;
    const reason = formData.get("reason") as string;
    await rejectTemplate(templateId, reason || "Non conforme aux standards");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Modération templates</h1>
      <p className="mt-2 text-muted-foreground">
        {pending.length} template(s) en attente de review
      </p>

      <div className="mt-8 space-y-6">
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun template en attente.
            </CardContent>
          </Card>
        ) : (
          pending.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{template.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.seller.user.name} · {template.category.name} ·{" "}
                      {formatPrice(Number(template.price))}
                    </p>
                  </div>
                  <Badge>{template.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{template.description}</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <form action={approveAction} className="flex-1">
                    <input type="hidden" name="templateId" value={template.id} />
                    <Button type="submit" className="w-full sm:w-auto">
                      Approuver
                    </Button>
                  </form>
                  <form action={rejectAction} className="flex flex-1 gap-2">
                    <input type="hidden" name="templateId" value={template.id} />
                    <Input name="reason" placeholder="Motif du rejet..." className="flex-1" />
                    <Button type="submit" variant="destructive">
                      Rejeter
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
