import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { completePaymentByReference } from "@/lib/checkout";

interface PageProps {
  searchParams: Promise<{ reference?: string; dev?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { reference, dev } = await searchParams;

  let paymentOk = false;
  let errorMessage: string | null = null;

  if (reference) {
    try {
      await completePaymentByReference(reference, dev === "1");
      paymentOk = true;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Erreur de confirmation";
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            {paymentOk ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-accent mb-4" />
                <CardTitle>Paiement confirmé</CardTitle>
              </>
            ) : (
              <>
                <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <CardTitle>Confirmation en attente</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {paymentOk ? (
              <p className="text-muted-foreground">
                Votre achat a été enregistré. Consultez vos achats pour télécharger le template.
              </p>
            ) : (
              <p className="text-muted-foreground">
                {errorMessage ??
                  "Si vous venez de payer, la confirmation peut prendre quelques secondes."}
              </p>
            )}
            {reference && (
              <p className="text-xs text-muted-foreground">Réf: {reference}</p>
            )}
            <Button asChild className="w-full">
              <Link href="/dashboard">Voir mes achats</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
