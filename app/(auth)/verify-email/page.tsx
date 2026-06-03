import Link from "next/link";
import { verifyEmail } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token manquant</CardTitle>
          <CardDescription>Le lien de vérification est invalide.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const result = await verifyEmail(token);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.success ? "Email vérifié!" : "Erreur"}</CardTitle>
        <CardDescription>
          {result.success
            ? "Votre email a été vérifié avec succès."
            : result.error}
        </CardDescription>
      </CardHeader>
      {result.success && (
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
