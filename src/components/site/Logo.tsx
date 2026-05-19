import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-red text-primary-foreground font-display text-lg shadow-red transition-transform group-hover:scale-105">
        P
      </span>
      <span className="font-display text-lg tracking-tight">
        PROMO<span className="text-gold">FRAIS</span>
      </span>
    </Link>
  );
}
