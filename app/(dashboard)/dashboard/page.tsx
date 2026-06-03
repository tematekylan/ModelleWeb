import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const purchases = await prisma.purchase.findMany({
    where: { buyerId: session!.user.id },
    include: {
      template: { include: { images: { where: { isPrimary: true }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Mes achats</h1>
      <p className="mt-2 text-muted-foreground">
        Bienvenue, {session!.user.name}
      </p>

      {purchases.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Vous n&apos;avez pas encore acheté de template.</p>
            <Button className="mt-4" asChild>
              <Link href="/templates">Parcourir les templates</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{purchase.template.title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(Number(purchase.amount))}
                </span>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm">
                  <Link href={`/api/download/${purchase.id}`}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
