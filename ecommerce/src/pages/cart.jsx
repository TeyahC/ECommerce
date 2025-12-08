import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// Fetch cart from Supabase
export async function fetchCart(userId) {
  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // ignore if no cart exists
  return data?.items || [];
}

// Save cart to Supabase
export async function saveCart(userId, items) {
  console.log("👉 saveCart called with:", {
    userIdType: typeof userId,
    userId,
    itemsType: typeof items,
    items,
  });

  const { data, error } = await supabase
    .from("carts")
    .upsert({ user_id: userId, items }, { onConflict: "user_id" });

  console.log("👉 Supabase response:", { data, error });

  if (error) throw error;
  return data;
}

// Add product to cart
export async function addToCart(userId, product) {
  const cart = await fetchCart(userId);
  const existing = cart.find((x) => x.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  await saveCart(userId, cart);
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Load user session
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load cart for user or guest
  useEffect(() => {
    async function loadCart() {
      if (user) {
        const items = await fetchCart(user.id);
        setCart(items);
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(localCart);
      }
    }
    loadCart();
  }, [user]);

  function updateQuantity(productId, newQty) {
    const updatedCart = cart.map((p) =>
      p.id === productId ? { ...p, quantity: newQty } : p
    );
    setCart(updatedCart);
    if (user) saveCart(user.id, updatedCart);
    else localStorage.setItem("cart", JSON.stringify(updatedCart));
  }

  function removeProduct(productId) {
    const updatedCart = cart.filter((p) => p.id !== productId);
    setCart(updatedCart);
    if (user) saveCart(user.id, updatedCart);
    else localStorage.setItem("cart", JSON.stringify(updatedCart));
  }

  return (
    <div className="page-wrapper">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div className="products-grid">
          {cart.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
              <p className="price">£{p.price}</p>
              <input
                type="number"
                value={p.quantity}
                min="1"
                onChange={(e) => updateQuantity(p.id, +e.target.value)}
              />
              <button onClick={() => removeProduct(p.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
