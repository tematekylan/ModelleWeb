import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice } from "@/lib/templates";
import { formatPrice } from "@/lib/utils";
import { initiateCheckout } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { templateId } = await params;
  const template = await prisma.template.findUnique({
    where: { id: templateId, status: "PUBLISHED" },
    include: { seller: { include: { user: true } } },
  });

  if (!template) notFound();

  const existing = await prisma.purchase.findUnique({
    where: {
      buyerId_templateId: { buyerId: session.user.id, templateId },
    },
  });
  if (existing) redirect("/dashboard");

  const price = getEffectivePrice(template);

  async function checkoutAction() {
    "use server";
    const user = await auth();
    if (!user?.user) throw new Error("Unauthorized");

    try {
      const { paymentUrl } = await initiateCheckout(templateId, user.user.id);
      redirect(paymentUrl);
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Finaliser l&apos;achat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg">{template.title}</h2>
              <p className="text-sm text-muted-foreground">
                Vendeur: {template.seller.user.name}
              </p>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span>Total</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Vous serez redirigé vers Paystack pour payer par carte ou Mobile Money.
            </p>
            <form action={checkoutAction}>
              <Button type="submit" className="w-full" size="lg">
                Payer avec Paystack
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
