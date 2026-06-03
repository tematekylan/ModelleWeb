"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerUser, type RegisterState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: RegisterState = {};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const isSeller = searchParams.get("role") === "seller";
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Un lien de vérification a été envoyé à votre adresse email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Aller à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          {isSeller ? "Créez votre compte vendeur" : "Créez votre compte acheteur"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={isSeller ? "seller" : "buyer"} />
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Déjà inscrit?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
