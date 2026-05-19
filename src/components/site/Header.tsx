import { Link } from "@tanstack/react-router";
import { Search, MapPin, Menu, X, Heart, User } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

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
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-red text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-medium tracking-wide">PROMOFRAIS Djerba — Houmt Souk · Midoun · Aghir</span>
          </div>
          <div className="hidden sm:block opacity-90">Livraison & Click&Collect disponibles</div>
        </div>
      </div>
      <div className="border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
          <Logo />
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
            <button className="hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40">
              <Heart className="h-4 w-4" />
            </button>
            <Link to="/login" className="hidden md:inline-grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold hover:border-gold/40">
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden inline-grid h-10 w-10 place-items-center rounded-full border border-border"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-2 py-3 text-sm text-foreground/80 hover:text-gold"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
