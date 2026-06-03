import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, Upload } from "lucide-react";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      templates: { orderBy: { updatedAt: "desc" }, take: 5 },
      _count: { select: { templates: true } },
    },
  });

  if (!seller) redirect("/dashboard");

  const recentSales = await prisma.purchase.findMany({
    where: { sellerId: seller.id },
    include: { template: true, buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Espace vendeur</h1>
          <p className="mt-2 text-muted-foreground">{seller.companyName ?? session.user.name}</p>
        </div>
        <Button asChild>
          <Link href="/seller/upload">
            <Upload className="mr-2 h-4 w-4" />
            Nouveau template
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seller.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus nets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(Number(seller.totalEarnings))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seller._count.templates}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mes templates</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seller/templates">Voir tout</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {seller.templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.status}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(Number(t.price))}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Ventes récentes</h2>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune vente pour le moment.</p>
            ) : (
              recentSales.map((sale) => (
                <Card key={sale.id}>
                  <CardContent className="py-4">
                    <p className="font-medium">{sale.template.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.buyer.name} · {formatPrice(Number(sale.netAmount))} net
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
