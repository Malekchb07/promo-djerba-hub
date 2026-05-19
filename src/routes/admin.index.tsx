import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/lib/admin-stats.functions";
import { Package, Tag, Ticket, Trophy, Users, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  if (isLoading) return <div className="grid place-items-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  if (!data) return null;

  const cards = [
    { label: "Produits", value: data.products, icon: Package },
    { label: "Promotions actives", value: data.promotions, icon: Tag },
    { label: "Coupons actifs", value: data.coupons, icon: Ticket },
    { label: "Coupons utilisés", value: data.redemptions, icon: TrendingUp },
    { label: "Concours actifs", value: data.competitions, icon: Trophy },
    { label: "Participants", value: data.participants, icon: Users },
    { label: "Tours de roue", value: data.spinsTotal, icon: Sparkles },
    { label: "Gains attribués", value: data.spinsWinning, icon: Trophy },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la plateforme PROMOFRAIS Djerba.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/10 text-gold"><c.icon className="h-4 w-4" /></div>
            </div>
            <div className="font-display text-3xl text-gold">{c.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl mb-1">Tours de roue · 14 derniers jours</h2>
        <p className="text-xs text-muted-foreground mb-5">Activité du jeu de fidélité</p>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={data.chart}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="date" stroke="oklch(0.65 0.01 270)" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="oklch(0.65 0.01 270)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.11 0.008 270)", border: "1px solid oklch(0.78 0.14 80 / 0.3)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="oklch(0.78 0.14 80)" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
