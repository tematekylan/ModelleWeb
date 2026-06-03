import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="font-bold text-lg">
              TemplateHub CM
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Marketplace de modèles de sites web modernes pour le Cameroun et l&apos;Afrique.
              Paiement sécurisé via Paystack (carte, Mobile Money).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Marketplace</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/templates" className="hover:text-foreground">Tous les templates</Link></li>
              <li><Link href="/templates?featured=true" className="hover:text-foreground">Featured</Link></li>
              <li><Link href="/register?role=seller" className="hover:text-foreground">Devenir vendeur</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Légal</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Conditions d&apos;utilisation</Link></li>
              <li><Link href="#" className="hover:text-foreground">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TemplateHub CM. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
