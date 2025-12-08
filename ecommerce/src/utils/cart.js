import { supabase } from "../supabase";

// Fetch cart for a logged-in user
export async function fetchCart(userId) {
  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // ignore if no cart exists
  return data?.items || [];
}

// Save cart for a logged-in user
export async function saveCart(userId, items) {
  const { data, error } = await supabase
    .from("carts")
    .upsert({ user_id: userId, items })
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

// Add product to cart (either localStorage for guests or supabase for logged-in users)
export async function addToCart(userId, product) {
  if (userId) {
    const cart = await fetchCart(userId);
    const existing = cart.find((x) => x.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    await saveCart(userId, cart);
  } else {
    // localStorage fallback for guests
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((x) => x.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}
