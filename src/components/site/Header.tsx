import { Link } from "@tanstack/react-router";
import { Search, MapPin, Menu, X, Heart, User, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { useCart, useWishlist } from "@/hooks/use-shop-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/promotions", label: "Promotions" },
  { to: "/products", label: "Produits" },
  { to: "/coupons", label: "Coupons" },
  { to: "/wheel", label: "Roue" },
  { to: "/catalogues", label: "Catalogues" },
  { to: "/stores", label: "Magasins" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { count: wishCount } = useWishlist();
  const { count: cartCount } = useCart();
  const initial = (user?.user_metadata?.full_name as string | undefined)?.trim()?.[0]
    ?? user?.email?.[0]?.toUpperCase() ?? "";
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-red text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-medium tracking-wide">PROMOFRAIS Djerba — Houmt Souk</span>
          </div>
          <div className="hidden sm:block opacity-90">Livraison & Click&Collect disponibles</div>
        </div>
      </div>
      <div className="border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 lg:flex lg:gap-6">
          <div className="min-w-0"><Logo /></div>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "px-3 py-2 text-sm text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40">
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Mes favoris"
              className="relative hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40"
            >
              <Heart className="h-4 w-4" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Mon panier"
              className="relative hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold text-sm font-semibold transition-colors hover:bg-gold/20"
                    aria-label="Mon compte"
                  >
                    {initial || <User className="h-4 w-4" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {(user.user_metadata?.full_name as string | undefined) ?? user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Espace admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/wheel" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Ma roue
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40"
                aria-label="Connexion"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full lg:hidden"
                  aria-label="Ouvrir le menu"
                  aria-expanded={open}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="z-[70] flex w-[min(88vw,22rem)] flex-col overflow-y-auto border-border bg-background p-0">
                <SheetHeader className="border-b border-border px-5 py-5 text-left">
                  <SheetTitle><Logo /></SheetTitle>
                </SheetHeader>
                <nav className="flex flex-1 flex-col px-4 py-3" aria-label="Navigation mobile">
                  {NAV.map((n) => (
                    <SheetClose asChild key={n.to}>
                      <Link
                        to={n.to}
                        className="border-b border-border/60 px-2 py-3.5 text-base text-foreground/80 transition-colors hover:text-gold"
                      >
                        {n.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link to="/wishlist" className="flex items-center justify-between border-b border-border/60 px-2 py-3.5 text-base text-foreground/80">
                      <span className="flex items-center gap-3"><Heart className="h-4 w-4" /> Mes favoris</span>
                      {wishCount > 0 && <span className="text-sm font-semibold text-gold">{wishCount}</span>}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/cart" className="flex items-center justify-between border-b border-border/60 px-2 py-3.5 text-base text-foreground/80">
                      <span className="flex items-center gap-3"><ShoppingCart className="h-4 w-4" /> Mon panier</span>
                      {cartCount > 0 && <span className="text-sm font-semibold text-gold">{cartCount}</span>}
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link to="/admin" className="flex items-center gap-3 border-b border-border/60 px-2 py-3.5 text-base text-gold">
                        <LayoutDashboard className="h-4 w-4" /> Espace admin
                      </Link>
                    </SheetClose>
                  )}
                  {user ? (
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => signOut()}
                        className="mt-3 h-11 justify-start px-2 text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" /> Se déconnecter
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/login" className="mt-3 flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                        Connexion
                      </Link>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
