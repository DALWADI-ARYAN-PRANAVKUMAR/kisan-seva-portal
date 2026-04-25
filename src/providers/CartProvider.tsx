import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  listing_id: string;
  title: string;
  price_per_kg: number;
  image_url: string | null;
  seller_name: string;
  unit: string;
  quantity: number;
};

const CartCtx = createContext<{
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}>({ items: [], add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {}, count: 0, subtotal: 0 });

const STORAGE_KEY = "ks_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.listing_id === item.listing_id);
      if (found) return prev.map((i) => i.listing_id === item.listing_id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...item, quantity: qty }];
    });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.listing_id !== id));
  const setQty = (id: string, qty: number) => setItems((prev) => prev.map((i) => i.listing_id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price_per_kg, 0);

  return <CartCtx.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>{children}</CartCtx.Provider>;
};

export const useCart = () => useContext(CartCtx);
