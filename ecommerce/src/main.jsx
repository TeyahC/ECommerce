import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Login from "./pages/Login.jsx";
import Cart from "./pages/cart.jsx";
import CustomerLogin from "./pages/Customer.jsx";
import Header from "./components/Header.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/customer" element={<CustomerLogin />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>
);
