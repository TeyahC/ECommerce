import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchCart, saveCart } from "../utils/cart.js";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();

  // Load cart
  useEffect(() => {
    async function loadCart() {
      if (user) setCart(await fetchCart(user.id));
      else setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    }
    loadCart();
  }, [user]);

  const updateQuantity = (id, qty) => {
    const updated = cart.map((p) =>
      p.id === id ? { ...p, quantity: qty } : p
    );
    setCart(updated);
    if (user) saveCart(user.id, updated);
    else localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeProduct = (id) => {
    const updated = cart.filter((p) => p.id !== id);
    setCart(updated);
    if (user) saveCart(user.id, updated);
    else localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleCheckout = async () => {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, userId: user?.id }),
    });
    const data = await res.json();
    window.location.href = data.checkoutUrl;
  };

  return (
    <div className="page-wrapper">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <div className="products-grid">
            {cart.map((p) => (
              <div key={p.id} className="product-card">
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="price">£{p.price.toFixed(2)}</p>
                <input
                  type="number"
                  min="1"
                  value={p.quantity}
                  onChange={(e) => updateQuantity(p.id, +e.target.value)}
                />
                <button onClick={() => removeProduct(p.id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Total: £{total.toFixed(2)}</h2>
            <button
              className="checkout-btn"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
