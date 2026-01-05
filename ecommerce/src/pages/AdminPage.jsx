import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    images: "",
  });
  const [restoredNotice, setRestoredNotice] = useState(false);
  const formRef = useRef(null); // Ref for scrolling to form

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin:newProduct");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.values(parsed).some((v) => v)) {
          setNewProduct(parsed);
          setRestoredNotice(true);
          setTimeout(() => setRestoredNotice(false), 2500);
        }
      }
    } catch (e) {
      console.warn("Could not restore admin form draft", e);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    try {
      localStorage.setItem("admin:newProduct", JSON.stringify(newProduct));
    } catch (e) {}
  }, [newProduct]);

  // Save draft on unload
  useEffect(() => {
    const onBeforeUnload = () => {
      try {
        localStorage.setItem("admin:newProduct", JSON.stringify(newProduct));
      } catch (e) {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [newProduct]);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    else setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function discardDraft() {
    localStorage.removeItem("admin:newProduct");
    setNewProduct({
      id: null,
      name: "",
      price: "",
      stock: "",
      image: "",
      description: "",
      images: "",
    });
  }

  async function addOrUpdateProduct(e) {
    e.preventDefault();
    const formattedProduct = {
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      image: newProduct.image,
      description: newProduct.description,
      images: newProduct.images
        ? newProduct.images.split(",").map((i) => i.trim())
        : [],
    };

    if (newProduct.id) {
      // Update existing
      const { error } = await supabase
        .from("products")
        .update(formattedProduct)
        .eq("id", newProduct.id);
      if (error) alert(error.message);
    } else {
      // Add new
      const { error } = await supabase
        .from("products")
        .insert([formattedProduct]);
      if (error) alert(error.message);
    }

    // Reset form
    setNewProduct({
      id: null,
      name: "",
      price: "",
      stock: "",
      image: "",
      description: "",
      images: "",
    });
    localStorage.removeItem("admin:newProduct");
    fetchProducts();
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

  const hasDraft = Object.values(newProduct).some((v) => v);

  return (
    <div className="page-wrapper">
      <h1>Admin Dashboard</h1>

      {hasDraft && (
        <div className="draft-notice">
          <span>Draft found. Your in-progress product is saved locally.</span>
          <button onClick={discardDraft}>Discard draft</button>
        </div>
      )}

      {restoredNotice && (
        <div className="restored-notice">Draft restored from storage.</div>
      )}

      {/* Add/Edit Product Form */}
      <div className="admin-form" ref={formRef}>
        <h2>{newProduct.id ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={addOrUpdateProduct}>
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
          <button type="submit" className="admin-btn">
            {newProduct.id ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>

      {/* Products Table */}
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
                <td>£{Number(p.price).toFixed(2)}</td>
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
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setNewProduct({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        stock: p.stock,
                        image: p.image,
                        description: p.description,
                        images: p.images?.join(",") || "",
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
