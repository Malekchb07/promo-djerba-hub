import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    // Verify admin
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) {
      throw new Error("Accès refusé : administrateur uniquement");
    }

    const [products, promotions, coupons, redemptions, competitions, participants, spins] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("promotions").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("coupons").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }),
      supabase.from("competitions").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("participants").select("id", { count: "exact", head: true }),
      supabase.from("wheel_spins").select("id, is_winning, spun_at").order("spun_at", { ascending: false }).limit(500),
    ]);

    const allSpins = spins.data ?? [];
    const wins = allSpins.filter((s) => s.is_winning).length;

    // Daily spins last 14 days
    const byDay = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      byDay.set(d, 0);
    }
    for (const s of allSpins) {
      const d = s.spun_at.slice(0, 10);
      if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const chart = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));

    return {
      products: products.count ?? 0,
      promotions: promotions.count ?? 0,
      coupons: coupons.count ?? 0,
      redemptions: redemptions.count ?? 0,
      competitions: competitions.count ?? 0,
      participants: participants.count ?? 0,
      spinsTotal: allSpins.length,
      spinsWinning: wins,
      chart,
    };
  });
