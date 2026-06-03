import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseButtonProps {
  templateId: string;
  slug: string;
  price: number;
  owned?: boolean;
  isAuthenticated?: boolean;
}

export function PurchaseButton({
  templateId,
  slug,
  price,
  owned = false,
  isAuthenticated = false,
}: PurchaseButtonProps) {
  if (owned) {
    return (
      <Button className="w-full" variant="secondary" asChild>
        <Link href="/dashboard">Déjà acheté — Télécharger</Link>
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button className="w-full" asChild>
        <Link href={`/login?callbackUrl=/templates/${slug}`}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Connectez-vous pour acheter
        </Link>
      </Button>
    );
  }

  return (
    <Button className="w-full" asChild>
      <Link href={`/checkout/${templateId}`}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Acheter — ${price.toFixed(2)}
      </Link>
    </Button>
  );
}
