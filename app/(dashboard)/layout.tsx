import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <Header />
      <div className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex gap-4 text-sm">
            <Link href="/dashboard" className="font-medium hover:text-primary">
              Mes achats
            </Link>
            {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
              <Link href="/seller" className="font-medium hover:text-primary">
                Vendeur
              </Link>
            )}
            {session.user.role === "ADMIN" && (
              <Link href="/admin/templates" className="font-medium hover:text-primary">
                Admin
              </Link>
            )}
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
      </div>
      <Footer />
    </>
  );
}
