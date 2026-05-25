import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ coupon_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", data.coupon_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!coupon) throw new Error("Coupon introuvable ou expiré");
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error("Coupon expiré");
    }

    // 1 claim par utilisateur — si déjà récupéré, renvoyer le QR existant
    const { data: existing } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", data.coupon_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return {
        redemptionId: existing.id,
        code: coupon.code,
        label: coupon.label,
        alreadyClaimed: true,
        qrPayload: `PROMOFRAIS|${coupon.code}|${existing.id}|${userId}`,
      };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error("Quota de coupons atteint");
    }

    const { data: ins, error } = await supabase
      .from("coupon_redemptions")
      .insert({ coupon_id: data.coupon_id, user_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from("coupons")
      .update({ used_count: (coupon.used_count ?? 0) + 1 })
      .eq("id", data.coupon_id);

    return {
      redemptionId: ins.id,
      code: coupon.code,
      label: coupon.label,
      alreadyClaimed: false,
      qrPayload: `PROMOFRAIS|${coupon.code}|${ins.id}|${userId}`,
    };
  });

export const listPublicCoupons = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
  const { data } = await supa
    .from("coupons")
    .select("id,code,label,description,discount_percent,discount_amount,expires_at,min_purchase,usage_limit,used_count")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return { items: data ?? [] };
});

export const listMyRedemptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("coupon_redemptions")
      .select("id,coupon_id,redeemed_at")
      .eq("user_id", userId);
    return { items: data ?? [] };
  });

export const listPublicCatalogues = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
  const { data } = await supa
    .from("catalogues")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });
  return { items: data ?? [] };
});

export const getCatalogue = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
    const { data: item } = await supa
      .from("catalogues")
      .select("*")
      .eq("id", data.id)
      .eq("is_active", true)
      .maybeSingle();
    return { item };
  });
