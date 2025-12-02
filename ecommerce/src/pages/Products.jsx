import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("products").select("*");
      setProducts(data);
    }
    load();
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
      >
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <img src={p.image} style={{ width: "100%" }} />
            <h3>{p.name}</h3>
            <p>£{p.price}</p>
          </div>
        ))}
        <button onClick={() => addToCart(p)}>Add to Cart</button>
      </div>
    </div>
  );
}
