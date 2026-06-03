"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LayoutGrid, User, LogOut, Store, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="rounded-lg bg-primary px-2 py-1 text-primary-foreground text-sm">TH</span>
          <span className="hidden sm:inline">TemplateHub CM</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link href="/templates?featured=true" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Featured
          </Link>
          {user?.role === "SELLER" || user?.role === "ADMIN" ? (
            <Link href="/seller" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Vendeur
            </Link>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link href="/admin/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {(user.role === "SELLER" || user.role === "ADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller" className="cursor-pointer">
                      <Store className="mr-2 h-4 w-4" />
                      Espace vendeur
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/templates" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Inscription</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
