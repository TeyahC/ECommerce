import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { addToCart } from "../utils/cart.js"; // ← centralized cart function
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error(error);
      setProducts(data || []);
    }
    load();
  }, []);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Our Products</h1>

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <Link to={`/products/${p.id}`}>
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
            </Link>

            <p className="price">£{p.price}</p>
            <button onClick={() => addToCart(null, p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
