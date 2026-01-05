import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { addToCart } from "../utils/cart.js";
import { Link } from "react-router-dom";

// Toast component
function Toast({ product, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in
    setVisible(true);

    // Auto-close after 3s with slide-out
    const timer = setTimeout(() => {
      setVisible(false);
      // Remove after animation completes
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${visible ? "show" : ""}`}>
      <img src={product.image} alt={product.name} />
      <div>
        <strong>{product.name}</strong> added to cart!
      </div>
      <div className="toast-bar" />
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error(error);
      setProducts(data || []);
    }
    load();
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(null, product); // replace null with userId if logged in
    setToasts((prev) => [...prev, { id: Date.now(), product }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <div className="page-wrapper">
        <h1 className="page-title">Our Products</h1>

        <div className="products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <Link
                to={`/products/${p.id}`}
                className="product-link"
                style={{ width: "100%", textAlign: "center" }}
              >
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="price">£{Number(p.price).toFixed(2)}</p>
              </Link>

              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            product={t.product}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </>
  );
}
