import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { addToCart as addToCartUtils } from "../utils/cart"; // your cart.js
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/styles.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const { user } = useAuth();

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

  // user comes from AuthContext

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
          <div className="main-image">
            <img src={images[currentImage]} alt={product.name} />
          </div>

          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setCurrentImage(index)}
                  className={`thumbnail ${
                    currentImage === index ? "active-thumb" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="product-info">
          <p className="price">£{Number(product.price).toFixed(2)}</p>
          <p>{product.description}</p>
          <button className="admin-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
      ;
    </div>
  );
}
