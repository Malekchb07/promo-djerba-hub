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
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error("Quota atteint");
    }

    // Check if user already claimed
    const { data: existing } = await supabase
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", data.coupon_id)
      .eq("user_id", userId)
      .maybeSingle();

    let redemptionId = existing?.id;
    if (!existing) {
      const { data: ins, error } = await supabase
        .from("coupon_redemptions")
        .insert({ coupon_id: data.coupon_id, user_id: userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      redemptionId = ins.id;
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 })
        .eq("id", data.coupon_id);
    }

    return {
      redemptionId,
      code: coupon.code,
      label: coupon.label,
      // QR payload — scannable at the till
      qrPayload: `PROMOFRAIS|${coupon.code}|${redemptionId}|${userId}`,
    };
  });

export const listPublicCoupons = createServerFn({ method: "GET" }).handler(async () => {
  // Uses anon RLS; public read of active coupons
  const { createClient } = await import("@supabase/supabase-js");
  const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
  const { data } = await supa
    .from("coupons")
    .select("id,code,label,description,discount_percent,discount_amount,expires_at,min_purchase")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
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
