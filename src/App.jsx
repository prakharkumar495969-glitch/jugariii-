/*
JUGARIII Store - Single File App (src/App.jsx)

Notes:
- FINAL DESIGN: Pink Theme, Swiper Slider, All Images Integrated.
- LATEST UPDATE: Full Checkout, COD (₹70 Fee), Razorpay, and FORM data sent to FORMSPREE.

- CONFIGURATION CHECK:
  - RAZORPAY TEST KEY: rzp_test_RPHdAAsUxsoqhz
  - COD FEE: 70
  - FORMSPREE ENDPOINT: https://formspree.io/f/xjkarnaq (Aapka Address Data Yahin Aayega)
*/

import React, { useState, useEffect } from "react";

// --- START: PRODUCT CONFIGURATION ---
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    title: "Couple Edition: Romantic Dares & Truths",
    price: 299,
    desc: "Ignite intimacy and romance with cards tailored for couples. Play levels from playful to flirty to steamy. The perfect way to explore a deeper connection and enjoy romantic challenges together.",
    img: "/images/1000119681.png",
    gallery: [ 
        "/images/1000119681.png",
        "/images/1000119689.jpg",
        "/images/1000119695.png",
    ],
    qty: 50,
  },
  {
    id: "p2",
    title: "Friends Edition: Truth, Dare & Situation Cards",
    price: 249,
    desc: "Unleash fun with crazy challenges, wild dares, and spicy truths—perfect for parties, hangouts and sleepovers. This pack is designed to reveal secrets and create unforgettable, hilarious memories.",
    img: "/images/1000119692.png",
    gallery: [
        "/images/1000119692.png",
        "/images/1000119690.png",
        "/images/1000119691.png",
    ],
    qty: 100,
  },
  {
    id: "p3",
    title: "Office Anarchy: Dare & Situation Edition",
    price: 349,
    desc: "Workplace-inspired dares and situations for office parties, icebreakers and team building—fun but HR-safe. Turn dull meetings into engaging, laughter-filled sessions with your colleagues.",
    img: "/images/1000119735.png",
    gallery: [
        "/images/1000119735.png",
        "/images/1000119739.png",
        "/images/1000119737.png",
    ],
    qty: 75,
  },
];
// --- END: PRODUCT CONFIGURATION ---

// --- COD, PAYMENT, & DATA CONFIGURATION ---
const COD_FEE = 70;
const RAZORPAY_KEY_ID = "rzp_test_RPHdAAsUxsoqhz"; 
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjkarnaq"; // <--- YOUR INTEGRATED FORM ENDPOINT
// --- END: CONFIGURATION ---

function currencyINR(n) {
  return `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const BANNER_SLIDES = [
    { img: "/images/1000119742.png", headline: "Truth and Dare: Friends Edition – Spill the Beans!" },
    { img: "/images/1000119679.png", headline: "Couple Edition – Spice Up Your Date Night!" },
    { img: "/images/1000119744.png", headline: "Office Anarchy – Climb the Corporate Ladder!" },
];


export default function App() {
  const [products] = useState(SAMPLE_PRODUCTS);
  const [cart, setCart] = useState({});
  const [selected, setSelected] = useState(null);
  const [showCart, setShowCart] = useState(false);
  
  const [checkout, setCheckout] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    address: "",
    paymentMethod: "online", // 'online' (Razorpay) or 'cod'
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("jugariii_cart_v1");
    if (saved) setCart(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("jugariii_cart_v1", JSON.stringify(cart));
  }, [cart]);

  // Swiper initialization useEffect
  useEffect(() => {
    if (window.Swiper) {
        new window.Swiper('.mySwiper', {
            loop: true,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true,
            },
        });
    }
  }, []);

  useEffect(() => {
    if (selected) {
      setModalImage(selected.img);
    } else {
      setModalImage(null);
    }
  }, [selected]);


  function addToCart(pid, qty = 1) {
    setCart((c) => {
      const cur = { ...c };
      cur[pid] = (cur[pid] || 0) + qty;
      return cur;
    });
    setShowCart(true);
  }

  function removeFromCart(pid) {
    setCart((c) => {
      const cur = { ...c };
      delete cur[pid];
      return cur;
    });
  }

  function updateQty(pid, val) {
    const v = Math.max(0, Number(val || 0));
    setCart((c) => {
      const cur = { ...c };
      if (v === 0) delete cur[pid];
      else cur[pid] = v;
      return cur;
    });
  }
  
  function cartBaseTotal() {
    return Object.entries(cart).reduce((sum, [pid, qty]) => {
      const p = products.find((x) => x.id === pid);
      if (!p) return sum;
      return sum + p.price * qty;
    }, 0);
  }

  function cartFinalTotal() {
    let total = cartBaseTotal();
    if (checkout.paymentMethod === 'cod') {
        total += COD_FEE;
    }
    return total;
  }
  
  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckout(prev => ({ ...prev, [name]: value }));
  };

  // Function to send data to Formspree
  async function sendOrderToFormspree(data) {
    if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ENDPOINT_URL_HERE')) {
        console.error("Formspree Endpoint is not configured. Order data not sent.");
        return;
    }
    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log("Order Data successfully submitted to Formspree!");
        } else {
            console.error("Formspree submission failed. Status:", response.status);
        }
    } catch (error) {
        console.error('Formspree Network error:', error);
    }
  }


  function payWithRazorpay(orderInfo) {
    if (!RAZORPAY_KEY_ID) {
      alert("Razorpay key not set. For testing, set RAZORPAY_KEY_ID in src/App.jsx");
      return;
    }
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderInfo.amount * 100, // paisa
      currency: "INR",
      name: "JUGARIII",
      description: orderInfo.items.map(i => i.title).join(", "),
      handler: function (response) {
        const finalData = { 
            ...orderInfo.formData, // Capture full customer details
            'Payment_Status': 'Paid (Razorpay)',
            'Razorpay_ID': response.razorpay_payment_id
        };
        
        // Send data to Formspree on successful payment
        sendOrderToFormspree(finalData);
        
        handleOrderPlaced(finalData);
      },
      prefill: {
        name: `${checkout.firstName} ${checkout.lastName}`,
        contact: checkout.phone,
        email: checkout.email
      },
      theme: {
        color: "#db2777" // Pink color
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  function placeOrder(e) {
    e.preventDefault();
    const { firstName, lastName, phone, address, city, state, paymentMethod } = checkout;
    
    // Basic validation
    if (!firstName || !phone || !address || !city || !state) {
      alert("Please fill in all required delivery details: Name, Phone, Address, City, and State.");
      return;
    }

    const items = Object.entries(cart).map(([pid, qty]) => {
      const p = products.find(x => x.id === pid);
      return { id: pid, title: p.title, qty, price: p.price };
    });
    
    // Format cart items for Formspree (for better Google Sheet readability)
    const orderItemsString = items.map(item => 
        `${item.title} (Qty: ${item.qty}, Price: ${currencyINR(item.price)})`
    ).join(' | ');

    const isCOD = paymentMethod === 'cod';
    const finalAmount = cartFinalTotal();

    const formData = {
        // --- DATA FOR YOUR GOOGLE SHEET/EMAIL ---
        'Order_Date': new Date().toLocaleString(),
        'Order_Amount': currencyINR(finalAmount),
        'Payment_Method': isCOD ? "COD" : "Online (Razorpay)",
        'COD_Fee': isCOD ? currencyINR(COD_FEE) : 'N/A',
        'Products_List': orderItemsString,
        // Customer Details
        'Customer_Name': `${firstName} ${lastName}`,
        'Mobile_Number': phone,
        'Email': checkout.email,
        'Full_Address': address,
        'City': city,
        'State': state,
    };

    if (isCOD) {
        // 1. COD Flow: Send Data to Formspree & Show Success
        sendOrderToFormspree({ ...formData, 'Payment_Status': 'Unpaid (COD)' });
        
        handleOrderPlaced(formData);
        alert(`COD Order Placed Successfully! Total: ${currencyINR(finalAmount)}. Your order details are being sent.`);
    } else {
        // 2. Online Payment Flow (Razorpay): Pass formData to the payment function
        payWithRazorpay({ 
            amount: finalAmount, 
            items: items, 
            formData: formData // Pass the address data here
        });
    }
  }

  function handleOrderPlaced(details) {
    setOrderPlaced(true);
    console.log("Order placed successfully. Details:", details);
    setCart({});
    localStorage.removeItem("jugariii_cart_v1");
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/1000119732.jpg" alt="JUGARIII Logo" className="w-10 h-10 rounded-md object-cover" />
            <h1 className="text-xl font-semibold">JUGARIII — Shop</h1>
          </div>
          <nav className="flex items-center gap-4">
            <button onClick={() => setShowCart((s) => !s)} className="relative p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5m5-5v5m6-5v5m-9 0h8" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* --- START: SWIPER HERO / BANNER --- */}
      <div className="relative h-[250px] sm:h-[400px] md:h-[500px] overflow-hidden">
          <div className="swiper mySwiper w-full h-full">
              <div className="swiper-wrapper">
                  {BANNER_SLIDES.map((slide, index) => (
                      <div key={index} className="swiper-slide relative">
                          <img 
                              src={slide.img} 
                              alt={`Banner ${index + 1}`} 
                              className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center p-4">
                              <h2 className="text-white text-2xl sm:text-4xl md:text-6xl font-extrabold text-center tracking-tight drop-shadow-lg">
                                  {slide.headline}
                              </h2>
                              <p className="mt-2 sm:mt-4 text-white/90 text-sm sm:text-xl font-medium hidden sm:block">Get ready to play the ultimate party game!</p>
                              <a href="#featured-products" className="mt-4 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm sm:text-lg rounded-full shadow-xl transition duration-300 transform hover:scale-105">
                                  Shop Now
                              </a>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="swiper-button-next text-white"></div>
              <div className="swiper-button-prev text-white"></div>
              <div className="swiper-pagination"></div>
          </div>
      </div>
      {/* --- END: SWIPER HERO / BANNER --- */}

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section id="featured-products">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Our Featured Game Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {products.map((p) => (
              <article key={p.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer">
                <div className="h-60 bg-gray-100">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600">{p.desc.substring(0, 80)}...</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xl font-extrabold text-pink-600">{currencyINR(p.price)}</div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelected(p)} className="text-sm px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">View</button>
                      <button onClick={() => addToCart(p.id)} className="text-sm px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-md transition">Add to Cart</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="why-shop" className="mt-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Why shop with JUGARIII?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-pink-600">
                <div className="text-xl font-bold mb-2">🚚 Fast Shipping</div>
                <div className="text-slate-600">Delivery across India in 3-5 days.</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-pink-600">
                <div className="text-xl font-bold mb-2">🔄 Easy Returns</div>
                <div className="text-slate-600">Hassle-free 7-day return policy.</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-pink-600">
                <div className="text-xl font-bold mb-2">🔒 Secure Checkout</div>
                <div className="text-slate-600">Powered by Razorpay (Secure payment gateway).</div>
            </div>
          </div>
        </section>
      </main>

      {/* Cart drawer */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg transform transition-transform ${showCart ? "translate-x-0" : "translate-x-full"} z-40`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Cart ({cartCount} Items)</h3>
          <button onClick={() => setShowCart(false)} className="text-slate-600 hover:text-red-600 transition">Close</button>
        </div>
        <div className="p-4 overflow-y-auto h-[55%] sm:h-[65vh]">
          {Object.keys(cart).length === 0 && <div className="text-slate-600 text-center py-10">Your fun starts here! Cart is empty.</div>}
          {Object.entries(cart).map(([pid, qty]) => {
            const p = products.find((x) => x.id === pid);
            if (!p) return null;
            return (
              <div key={pid} className="flex items-center gap-3 py-3 border-b">
                <img src={p.img} alt={p.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-slate-600">{currencyINR(p.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input className="w-14 border rounded text-center focus:border-pink-500" type="number" value={qty} onChange={(e) => updateQty(pid, e.target.value)} />
                  <button onClick={() => removeFromCart(pid)} className="text-sm text-red-600 hover:text-red-800 transition">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Checkout Section: Fields & Totals */}
        <div className="p-4 border-t absolute bottom-0 w-full bg-white">
          {!orderPlaced ? (
            <form onSubmit={placeOrder} className="space-y-3">
              {/* Payment Method Selector */}
              <div className="p-3 bg-pink-50 rounded-lg space-y-2">
                <div className="font-semibold text-sm mb-1">Select Payment Option:</div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="online" 
                    name="paymentMethod" 
                    value="online" 
                    checked={checkout.paymentMethod === 'online'} 
                    onChange={handleCheckoutChange}
                    className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                  />
                  <label htmlFor="online" className="ml-2 text-sm font-medium text-gray-700">Online Payment (Razorpay)</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="cod" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={checkout.paymentMethod === 'cod'} 
                    onChange={handleCheckoutChange}
                    className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                  />
                  <label htmlFor="cod" className="ml-2 text-sm font-medium text-gray-700">Cash On Delivery (COD) <span className="text-red-600">({currencyINR(COD_FEE)} Extra)</span></label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-sm border-b pb-2">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{currencyINR(cartBaseTotal())}</span></div>
                {checkout.paymentMethod === 'cod' && (
                  <div className="flex justify-between text-red-600"><span>COD Fee:</span><span className="font-medium">{currencyINR(COD_FEE)}</span></div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1"><span>Total Payable:</span><span className="text-pink-600">{currencyINR(cartFinalTotal())}</span></div>
              </div>

              
              {/* Checkout Fields */}
              <p className="text-xs text-slate-500 pt-2">**Please fill in your complete delivery details**</p>
              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="First Name *" name="firstName" value={checkout.firstName} onChange={handleCheckoutChange} />
                <input className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="Last Name" name="lastName" value={checkout.lastName} onChange={handleCheckoutChange} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="Mobile Number *" name="phone" value={checkout.phone} onChange={handleCheckoutChange} />
                <input className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="Email (Optional)" name="email" value={checkout.email} onChange={handleCheckoutChange} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="State *" name="state" value={checkout.state} onChange={handleCheckoutChange} />
                <input required className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="City *" name="city" value={checkout.city} onChange={handleCheckoutChange} />
              </div>
              <textarea required className="w-full border rounded px-3 py-2 text-sm focus:border-pink-500" placeholder="Full Address (House No, Street, Landmark) *" name="address" value={checkout.address} onChange={handleCheckoutChange} />
              
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition">
                    {checkout.paymentMethod === 'cod' ? `Place COD Order (${currencyINR(cartFinalTotal())})` : `Pay Now (${currencyINR(cartFinalTotal())})`}
                </button>
                <button type="button" onClick={() => { setCart({}); localStorage.removeItem("jugariii_cart_v1"); }} className="px-4 py-2 border rounded-lg hover:bg-slate-100 transition">Clear</button>
              </div>
            </form>
          ) : (
            <div className="text-center text-emerald-600 font-semibold p-4 bg-emerald-50 rounded-lg border border-emerald-300">Order placed successfully! We'll contact you on WhatsApp (demo).</div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[95vh] rounded-xl overflow-y-auto shadow-2xl">
            <div className="p-6">
                <div className="flex justify-end sticky top-0 bg-white pb-2 z-10">
                    <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-red-500 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
                
                {/* Image Gallery Column */}
                <div>
                  <div className="h-64 sm:h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-pink-100">
                    <img src={modalImage || selected.img} alt={selected.title} className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {selected.gallery.map((imgUrl, index) => (
                      <img 
                        key={index}
                        src={imgUrl} 
                        alt={`${selected.title} thumbnail ${index+1}`} 
                        className={`min-w-[64px] h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${modalImage === imgUrl ? 'border-pink-600 p-0.5' : 'border-slate-200 hover:border-pink-300'}`}
                        onClick={() => setModalImage(imgUrl)}
                      />
                    ))}
                  </div>
                </div>

                {/* Details Column */}
                <div className="md:border-l md:pl-6 pt-4 md:pt-0">
                  <h3 className="text-2xl sm:text-3xl font-bold text-pink-600">{selected.title}</h3>
                  
                  <div className="mt-4 text-2xl font-extrabold">{currencyINR(selected.price)}</div>

                  <p className="mt-4 text-slate-700 leading-relaxed border-t pt-4">{selected.desc}</p>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Game Details:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        <li>**Cards:** 50 Situation/Dare/Truth cards (Approx)</li>
                        <li>**Players:** 2+ Players (Perfect for couples or small groups)</li>
                        <li>**Best for:** {selected.title.includes('Couple') ? 'Date Nights, Anniversaries' : selected.title.includes('Friends') ? 'Parties, Get-togethers' : 'Office Parties, Team Building'}</li>
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => { addToCart(selected.id); setSelected(null); }} className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-xl font-semibold transition transform hover:scale-[1.02]">Add to cart</button>
                    <button onClick={() => setSelected(null)} className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 transition">Continue Shopping</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 py-6 text-center text-sm text-slate-500 border-t">© JUGARIII — Demo store • Frontend starter only</footer>
    </div>
  );
}
