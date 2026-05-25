import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

/* ---------- PRODUCTS ---------- */
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  price: z.number().min(0),
  old_price: z.number().min(0).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  promo_badge: z.string().max(50).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  category_id: z.string().uuid().nullable().optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("products").select("*").order("created_at", { ascending: false });
    return { items: data ?? [] };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- PROMOTIONS ---------- */
const promoSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(500).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  discount_percent: z.number().int().min(0).max(100).nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  category_id: z.string().uuid().nullable().optional(),
});

export const listPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("promotions").select("*").order("starts_at", { ascending: false });
    return { items: data ?? [] };
  });

export const upsertPromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => promoSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("promotions").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("promotions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- COUPONS ---------- */
const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/),
  label: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  discount_percent: z.number().int().min(0).max(100).nullable().optional(),
  discount_amount: z.number().min(0).nullable().optional(),
  min_purchase: z.number().min(0).nullable().optional(),
  usage_limit: z.number().int().min(0).nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("coupons").select("*").order("created_at", { ascending: false });
    return { items: data ?? [] };
  });

export const upsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => couponSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("coupons").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- COMPETITIONS ---------- */
const compSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  type: z.string().max(50).default("lottery"),
  image_url: z.string().url().nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const listCompetitions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("competitions").select("*").order("starts_at", { ascending: false });
    return { items: data ?? [] };
  });

export const upsertCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => compSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("competitions").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("competitions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- PARTICIPANTS ---------- */
export const listParticipants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("participants")
      .select("*, competitions(title)")
      .order("created_at", { ascending: false })
      .limit(500);
    return { items: data ?? [] };
  });

export const exportWinners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ competition_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows } = await context.supabase
      .from("participants")
      .select("id, full_name, email, phone, created_at, competitions(title)")
      .eq("competition_id", data.competition_id)
      .eq("is_winner", true)
      .order("created_at", { ascending: true });
    return { items: rows ?? [] };
  });

export const drawWinner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      competition_id: z.string().uuid(),
      count: z.number().int().min(1).max(50).default(1),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: parts } = await context.supabase
      .from("participants")
      .select("id, full_name, email")
      .eq("competition_id", data.competition_id)
      .eq("is_winner", false);
    if (!parts || parts.length === 0) throw new Error("Aucun participant éligible");
    const pool = [...parts];
    const winners: any[] = [];
    const n = Math.min(data.count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }
    const ids = winners.map((w) => w.id);
    const { error } = await context.supabase.from("participants").update({ is_winner: true }).in("id", ids);
    if (error) throw new Error(error.message);
    const { error: dErr } = await context.supabase.from("lottery_draws").insert(
      winners.map((w) => ({ competition_id: data.competition_id, participant_id: w.id, drawn_by: context.userId })),
    );
    if (dErr) throw new Error(dErr.message);
    return { winners };
  });

export const setWinner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ participant_id: z.string().uuid(), is_winner: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: part, error } = await context.supabase
      .from("participants")
      .update({ is_winner: data.is_winner })
      .eq("id", data.participant_id)
      .select("id, competition_id")
      .single();
    if (error) throw new Error(error.message);
    if (data.is_winner && part) {
      await context.supabase.from("lottery_draws").insert({
        competition_id: part.competition_id,
        participant_id: part.id,
        drawn_by: context.userId,
      });
    }
    return { ok: true };
  });

export const listDraws = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ competition_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows } = await context.supabase
      .from("lottery_draws")
      .select("id, drawn_at, drawn_by, participants(id, full_name, email, phone)")
      .eq("competition_id", data.competition_id)
      .order("drawn_at", { ascending: false });
    return { items: rows ?? [] };
  });

export const listEligibleParticipants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ competition_id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows } = await context.supabase
      .from("participants")
      .select("id, full_name, email, phone, is_winner, created_at")
      .eq("competition_id", data.competition_id)
      .order("created_at", { ascending: false });
    return { items: rows ?? [] };
  });

/* ---------- CATALOGUES ---------- */
const catSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  pdf_url: z.string().url(),
  cover_url: z.string().url().nullable().optional(),
  badge: z.string().max(50).nullable().optional(),
  page_count: z.number().int().min(1).max(500).nullable().optional(),
  published_at: z.string().default(() => new Date().toISOString()),
  is_active: z.boolean().default(true),
});

export const listCatalogues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("catalogues").select("*").order("published_at", { ascending: false });
    return { items: data ?? [] };
  });

export const upsertCatalogue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => catSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("catalogues").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCatalogue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("catalogues").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
