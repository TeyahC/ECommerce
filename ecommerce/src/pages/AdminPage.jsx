import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    images: "",
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

    const formattedProduct = {
      ...newProduct,
      images: newProduct.images
        ? newProduct.images.split(",").map((i) => i.trim())
        : [],
    };

    const { error } = await supabase
      .from("products")
      .insert([formattedProduct]);

    if (error) alert(error.message);
    else {
      setNewProduct({
        name: "",
        price: "",
        stock: "",
        image: "",
        description: "",
        images: "",
      });
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

      {/* ADD PRODUCT FORM */}
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
            placeholder="Main Image URL"
            value={newProduct.image}
            onChange={(e) =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />

          <input
            placeholder="Additional image URLs (comma separated)"
            value={newProduct.images}
            onChange={(e) =>
              setNewProduct({ ...newProduct, images: e.target.value })
            }
          />

          <button type="submit">Add Product</button>
        </form>
      </div>

      {/* PRODUCT TABLE */}
      <div className="table-wrapper">
        <h2>Products List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Main Image</th>
              <th>Description</th>
              <th>Extra Images</th>
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

                <td>{p.description?.slice(0, 50)}...</td>

                <td>
                  {p.images?.map((img, i) => (
                    <img key={i} src={img} alt="" width="40" />
                  ))}
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
