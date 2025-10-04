import React, { useState } from "react";
import "./App.css";

// ------------------------------
// 🛍️ Product Data
// ------------------------------
const products = [
  { id: 1, name: "JUGARIII Cotton Oversized T-Shirt", price: 499, image: "/images/1000119681.png" },
  { id: 2, name: "JUGARIII Graphic Print Hoodie", price: 999, image: "/images/1000119689.jpg" },
  { id: 3, name: "JUGARIII Cargo Pants", price: 799, image: "/images/1000119695.png" },
  { id: 4, name: "JUGARIII Crop Top", price: 499, image: "/images/1000119698.png" },
  { id: 5, name: "JUGARIII Unisex Joggers", price: 699, image: "/images/1000119701.png" },
];

// ------------------------------
// 💰 Utility Function
// ------------------------------
const currencyINR = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// ------------------------------
// 🔑 Razorpay Key
// ------------------------------
const RAZORPAY_KEY_ID = "rzp_test_RPHdAAsUxsoqhz"; // Replace with live key before production

// ------------------------------
// 🧠 Main App Component
// ------------------------------
export default function App() {
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState({ name: "", email: "", address: "", phone: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // --------------------------
  // 🛒 Cart Operations
  // --------------------------
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart(cart.map((item) => (item.id === id ? { ...item, qty } : item)));
  };

  const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // --------------------------
  // 💳 Razorpay Payment Handler
  // --------------------------
  const handleRazorpay = async () => {
    if (!checkout.name || !checkout.phone || !checkout.address) {
      alert("Please fill all required details before payment.");
      return;
    }

    const amount = cartTotal() * 100;
    const options = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "JUGARIII Store",
      description: "Order Payment",
      handler: function (response) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        sendFormspreeData("Razorpay");
      },
      prefill: {
        name: checkout.name,
        email: checkout.email,
        contact: checkout.phone,
      },
      theme: { color: "#ff4b91" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // --------------------------
  // 📩 Formspree Submit
  // --------------------------
  const sendFormspreeData = (paymentType) => {
    const formData = {
      ...checkout,
      paymentMethod: paymentType,
      orderItems: cart.map((i) => `${i.name} x${i.qty}`).join(", "),
      totalAmount: currencyINR(cartTotal()),
    };

    fetch("https://formspree.io/f/xjkarnaq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) setOrderPlaced(true);
      })
      .catch(() => alert("Network error! Please try again later."));
  };

  // --------------------------
  // 📦 Place Order (COD)
  // --------------------------
  const placeOrder = (e) => {
    e.preventDefault();
    if (!checkout.name || !checkout.phone || !checkout.address) {
      alert("Please fill all required details.");
      return;
    }

    if (paymentMethod === "COD") {
      sendFormspreeData("Cash on Delivery");
      alert("Order placed successfully! You selected Cash on Delivery.");
      setOrderPlaced(true);
    } else {
      handleRazorpay();
    }

    setCart([]);
  };

  // --------------------------
  // 🖼️ UI Rendering
  // --------------------------
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* 🏪 Header */}
      <header className="bg-black text-white py-4 shadow-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-center">JUGARIII Store 🛍️</h1>
      </header>

      {/* 🛍️ Product List */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-contain rounded-lg"
            />
            <h2 className="font-semibold mt-2">{product.name}</h2>
            <p className="text-pink-600 font-bold">{currencyINR(product.price)}</p>
            <button
              onClick={() => addToCart(product)}
              className="w-full mt-3 bg-black text-white py-2 rounded-lg hover:bg-pink-600 transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </section>

      {/* 🛒 Cart Section */}
      <section className="bg-white shadow-lg p-4 m-4 rounded-xl">
        <h2 className="text-xl font-bold mb-3">Your Cart 🛒</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b py-2"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {currencyINR(item.price)} × {item.qty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                    className="bg-gray-200 px-2 rounded"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                    className="bg-gray-200 px-2 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="text-right mt-4 font-bold text-lg">
              Total: {currencyINR(cartTotal())}
            </div>
          </>
        )}
      </section>

      {/* 🧾 Checkout Form */}
      {cart.length > 0 && !orderPlaced && (
        <section className="bg-white shadow-lg p-4 m-4 rounded-xl">
          <h2 className="text-xl font-bold mb-3">Checkout 🧾</h2>
          <form onSubmit={placeOrder} className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border rounded"
              value={checkout.name}
              onChange={(e) => setCheckout({ ...checkout, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email (optional)"
              className="w-full p-2 border rounded"
              value={checkout.email}
              onChange={(e) => setCheckout({ ...checkout, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-2 border rounded"
              value={checkout.phone}
              onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })}
              required
            />
            <textarea
              placeholder="Full Address"
              className="w-full p-2 border rounded"
              value={checkout.address}
              onChange={(e) => setCheckout({ ...checkout, address: e.target.value })}
              required
            />

            {/* Payment Method */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "Online"}
                  onChange={() => setPaymentMethod("Online")}
                />
                <span className="ml-2">Pay Online</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
            >
              {paymentMethod === "COD" ? "Place Order (COD)" : "Pay with Razorpay"}
            </button>
          </form>
        </section>
      )}

      {/* ✅ Order Success */}
      {orderPlaced && (
        <div className="m-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-700 font-semibold">
          🎉 Order placed successfully! We'll contact you soon on WhatsApp.
        </div>
      )}

      {/* ⚡ Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} JUGARIII Store. All Rights Reserved.
      </footer>
    </div>
  );
        }
