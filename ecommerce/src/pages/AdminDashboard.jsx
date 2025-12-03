import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
  });

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    else setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function addProduct(e) {
    e.preventDefault();
    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) alert(error.message);
    else {
      setNewProduct({ name: "", price: "", stock: "", image: "" });
      fetchProducts();
    }
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchProducts();
  }

  async function updateStock(id, newStock) {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);
    if (error) alert(error.message);
    else fetchProducts();
  }

  return (
    <div className="page-wrapper">
      <h1>Admin Dashboard</h1>

      <div className="admin-form">
        <h2>Add New Product</h2>
        <form onSubmit={addProduct}>
          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />
          <input
            placeholder="Image URL (optional)"
            value={newProduct.image}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
          />
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="table-wrapper">
        <h2>Products List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>£{p.price}</td>
                <td>
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => updateStock(p.id, e.target.value)}
                  />
                </td>
                <td>
                  {p.image && <img src={p.image} alt={p.name} width="50" />}
                </td>
                <td>
                  <button onClick={() => deleteProduct(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
