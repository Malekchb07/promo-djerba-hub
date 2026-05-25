import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  q: z.string().max(120).optional().default(""),
  category: z.string().max(80).optional().default(""),
  sort: z.enum(["newest", "price-asc", "price-desc", "promo", "name"]).optional().default("newest"),
  promoOnly: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(false),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(60).optional().default(12),
});

export const listCatalog = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => inputSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let query = supabaseAdmin
      .from("products")
      .select("id,name,description,price,old_price,image_url,stock,promo_badge,is_featured,category_id,created_at,categories(name,slug)", { count: "exact" })
      .eq("is_active", true);

    if (data.q) query = query.ilike("name", `%${data.q}%`);
    if (data.category) query = query.eq("categories.slug", data.category);
    if (data.promoOnly) query = query.not("old_price", "is", null);
    if (data.inStock) query = query.gt("stock", 0);
    if (data.minPrice != null) query = query.gte("price", data.minPrice);
    if (data.maxPrice != null) query = query.lte("price", data.maxPrice);

    switch (data.sort) {
      case "price-asc": query = query.order("price", { ascending: true }); break;
      case "price-desc": query = query.order("price", { ascending: false }); break;
      case "name": query = query.order("name", { ascending: true }); break;
      case "promo": query = query.order("old_price", { ascending: false, nullsFirst: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const { data: items, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const { data: cats } = await supabaseAdmin
      .from("categories")
      .select("id,name,slug")
      .order("display_order", { ascending: true });

    const { data: priceBounds } = await supabaseAdmin
      .from("products")
      .select("price")
      .eq("is_active", true)
      .order("price", { ascending: false })
      .limit(1);

    return {
      items: items ?? [],
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / data.pageSize)),
      categories: cats ?? [],
      maxPrice: priceBounds?.[0]?.price ?? 100,
    };
  });
