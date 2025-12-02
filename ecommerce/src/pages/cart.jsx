export function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find((x) => x.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}
