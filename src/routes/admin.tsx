import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { LayoutDashboard, Package, Tag, Ticket, Trophy, Users, FileText, LogOut, Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — PROMOFRAIS" }, { name: "robots", content: "noindex" }] }),
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/promotions", label: "Promotions", icon: Tag },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/competitions", label: "Concours", icon: Trophy },
  { to: "/admin/participants", label: "Participants", icon: Users },
  { to: "/admin/catalogues", label: "Catalogues", icon: FileText },
] as const;

function AdminLayout() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center rounded-3xl border border-gold/20 bg-card p-10">
          <h1 className="font-display text-3xl mb-3">Accès restreint</h1>
          <p className="text-muted-foreground mb-6">
            Votre compte n'a pas les droits administrateur. Contactez un administrateur pour obtenir l'accès.
          </p>
          <p className="text-xs text-muted-foreground mb-6">Connecté en tant que : {user.email}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => signOut().then(() => navigate({ to: "/login" }))}
              className="rounded-full bg-gradient-red px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-red">
              Se déconnecter
            </button>
            <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm">Accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface">
        <div className="p-6 border-b border-border"><Logo /></div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-gold/10 text-gold border border-gold/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={() => signOut().then(() => navigate({ to: "/login" }))}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-surface-2">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}

// Helper to prevent unused redirect import warning (used for future guards)
export const _r = redirect;
