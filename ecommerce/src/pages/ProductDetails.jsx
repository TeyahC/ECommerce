import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { addToCart as addToCartUtils } from "../utils/cart"; // your cart.js
import "../styles/styles.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [user, setUser] = useState(null);

  // Load product from Supabase
  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error(error);
      else setProduct(data);
    }
    fetchProduct();
  }, [id]);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    }
    loadUser();
  }, []);

  if (!product) return <p>Loading...</p>;

  // Ensure product.images exists, fallback to single image
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  // Handle add to cart
  const handleAddToCart = async () => {
    const userId = user?.id || null; // null for guests
    await addToCartUtils(userId, product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="page-wrapper">
      <h1>{product.name}</h1>

      <div className="product-detail">
        {/* Image gallery */}
        <div className="image-gallery">
          <img src={images[currentImage]} alt={product.name} />
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setCurrentImage(index)}
                  className={currentImage === index ? "active-thumb" : ""}
                  style={{ cursor: "pointer", width: "50px", margin: "5px" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="product-info">
          <p className="price">£{product.price}</p>
          <p>{product.description}</p>
          <button onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
