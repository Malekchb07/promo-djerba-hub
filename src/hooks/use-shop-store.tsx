import { useEffect, useState, useCallback } from "react";

type Item = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  qty?: number;
};

const CART_KEY = "promofrais:cart";
const WISH_KEY = "promofrais:wishlist";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("shop-store-change", { detail: { key } }));
}

function useStore(key: string) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems(read<Item>(key));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.key === key) setItems(read<Item>(key));
    };
    window.addEventListener("shop-store-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("shop-store-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  return [items, (next: Item[]) => write(key, next)] as const;
}

export function useCart() {
  const [items, set] = useStore(CART_KEY);
  const add = useCallback(
    (item: Item) => {
      const current = read<Item>(CART_KEY);
      const existing = current.find((i) => i.id === item.id);
      const next = existing
        ? current.map((i) => (i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i))
        : [...current, { ...item, qty: 1 }];
      write(CART_KEY, next);
    },
    [],
  );
  const remove = useCallback((id: string) => {
    write(CART_KEY, read<Item>(CART_KEY).filter((i) => i.id !== id));
  }, []);
  const clear = useCallback(() => write(CART_KEY, []), []);
  const count = items.reduce((s, i) => s + (i.qty || 1), 0);
  return { items, add, remove, clear, count };
}

export function useWishlist() {
  const [items, set] = useStore(WISH_KEY);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);
  const toggle = useCallback((item: Item) => {
    const current = read<Item>(WISH_KEY);
    const exists = current.some((i) => i.id === item.id);
    const next = exists ? current.filter((i) => i.id !== item.id) : [...current, item];
    write(WISH_KEY, next);
    return !exists;
  }, []);
  return { items, has, toggle, count: items.length };
}
