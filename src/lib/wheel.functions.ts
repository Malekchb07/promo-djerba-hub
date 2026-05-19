import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PRIZES = [
  { label: "5% de remise", value: "coupon-5", weight: 30, winning: true },
  { label: "10% de remise", value: "coupon-10", weight: 20, winning: true },
  { label: "Café offert", value: "cafe", weight: 15, winning: true },
  { label: "Bon 50 DT", value: "bon-50", weight: 8, winning: true },
  { label: "Panier 100 DT", value: "panier-100", weight: 4, winning: true },
  { label: "Séjour Djerba", value: "sejour", weight: 1, winning: true },
  { label: "Réessayez", value: "retry-1", weight: 12, winning: false },
  { label: "Réessayez", value: "retry-2", weight: 10, winning: false },
];

function pickPrize() {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) return { ...PRIZES[i], index: i };
  }
  return { ...PRIZES[0], index: 0 };
}

export const spinWheel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Limit: max 1 spin per 24h
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await supabase
      .from("wheel_spins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("spun_at", since);
    if ((count ?? 0) >= 1) {
      throw new Error("Vous avez déjà tourné la roue aujourd'hui. Revenez demain !");
    }

    const prize = pickPrize();
    const { error } = await supabase.from("wheel_spins").insert({
      user_id: userId,
      prize_label: prize.label,
      prize_value: prize.value,
      is_winning: prize.winning,
    });
    if (error) throw new Error(error.message);

    return { index: prize.index, label: prize.label, winning: prize.winning };
  });

export const getMySpins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("wheel_spins")
      .select("*")
      .eq("user_id", userId)
      .order("spun_at", { ascending: false })
      .limit(20);
    return { spins: data ?? [] };
  });

export const WHEEL_SECTORS = PRIZES.map((p) => p.label);
