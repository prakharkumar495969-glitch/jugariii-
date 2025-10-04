/*
JUGARIII Store - Single File App (src/App.jsx)

Notes:
- FINAL DESIGN: Pink Theme, Swiper Slider, All Images Integrated.
- LATEST UPDATE: Full Checkout, COD (₹70 Fee), Razorpay, and FORM data sent to FORMSPREE.
- IMAGE FIX: All images are using Direct URLs (ImgBB) to fix path issues.
- NEW FEATURE: How to Play added to product details.
- FIXES: Banner fullscreen, Cart quantity bug fixed, Product image slider in modal added.
*/

import React, { useState, useEffect, useRef } from "react";

// --- HOW TO PLAY CONFIGURATION ---
const HOW_TO_PLAY = {
    p1: { // Couple Edition
        players: "2",
        details: [
            "Shuffle and set the deck of romantic dares, truths, and situations.",
            "Bottle Spin: Spin a bottle between the couple. Whoever it points to picks a card and completes the challenge.",
            "Alternate Draw: Take turns drawing cards for each other, using penalties or rewards for completion.",
            "Extra Fun: Set mood with candles, music, or use bonus rules (like timer or extra dare on skip) for a playful night."
        ],
    },
    p2: { // Friends Edition
        players: "3+ friends",
        details: [
            "Shuffle the Truth, Dare & Situation cards and place them face down in a pile.",
            "Spin the Bottle: Seat friends in a circle. Spin a bottle—the person the bottle points to draws a card and performs the challenge.",
            "Pass and Draw: Players can take turns picking cards or ask group members to challenge one another.",
            "If you complete the dare/situation, keep the card as a point; if you pass, place the card back into the pile. Play for points or just for fun, as preferred."
        ],
    },
    p3: { // Office Anarchy
        players: "2+ office colleagues",
        details: [
            "Shuffle cards and keep the deck handy at your desk or meeting table.",
            "Desk Dare: Secretly place a card on a colleague’s desk; when they spot it, they must complete the task within office rules.",
            "Group Round: During office parties or breaks, draw cards for one another. Use spin-the-bottle (with a pen) or rock-paper-scissors to pick who tries a dare.",
            "Etiquette: Keep all actions office-friendly; encourage group participation and celebrate completed challenges."
        ],
    },
};
// --- END: HOW TO PLAY CONFIGURATION ---


// --- START: PRODUCT CONFIGURATION ---
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    title: "Couple Edition: Romantic Dares & Truths",
    price: 899,
    regularPrice: 1299,
    desc: "Ignite intimacy and romance with cards tailored for couples. Play levels from playful to flirty to steamy. The perfect way to explore a deeper connection and enjoy romantic challenges together.",
    img: "https://i.ibb.co/Q75y4Q62/1759511340714.png", 
    gallery: [ 
        "https://i.ibb.co/Q75y4Q62/1759511340714.png",
        "https://i.ibb.co/Xk4DFpLP/image-1.jpg",
        "https://i.ibb.co/kswyqYdk/image-9.png",
    ],
    qty: 50,
  },
  {
    id: "p2",
    title: "Friends Edition: Truth, Dare & Situation Cards",
    price: 549,
    regularPrice: 749,
    desc: "Unleash fun with crazy challenges, wild dares, and spicy truths—perfect for parties, hangouts and sleepovers. This pack is designed to reveal secrets and create unforgettable, hilarious memories.",
    img: "https://i.ibb.co/fVCp0KK0/image-6.png",
    gallery: [
        "https://i.ibb.co/fVCp0KK0/image-6.png",
        "https://i.ibb.co/rS7Yc38/image-7.png",
        "https://i.ibb.co/39DT7J0s/image-8.png",
        "https://i.ibb.co/fVF5WWTX/image-5.png"
    ],
    qty: 100,
  },
  {
    id: "p3",
    title: "Office Anarchy: Dare & Situation Edition",
    price: 649,
    regularPrice: 999,
    desc: "Workplace-inspired dares and situations for office parties, icebreakers and team building—fun but HR-safe. Turn dull meetings into engaging, laughter-filled sessions with your colleagues.",
    img: "https://i.ibb.co/mFPLTwTx/image-14.png",
    gallery: [
        "https://i.ibb.co/mFPLTwTx/image-14.png",
        "https://i.ibb.co/v4DBj0Xw/image-10.png",
        "https://i.ibb.co/MDs853pc/image-20.png",
    ],
    qty: 75,
  },
];
// --- END: PRODUCT CONFIGURATION ---

// --- CONFIGURATION ---
const COD_FEE = 70;
const RAZORPAY_KEY_ID = "rzp_test_RPHdAAsUxsoqhz"; 
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjkarnaq"; 
const INSTAGRAM_LINK = "https://www.instagram.com/jugariii?igsh=a3QxdmhjemdhM3Iy"; // New Instagram Link
const NEW_LOGO_URL = "https://i.ibb.co/TD1sPyPK/IMG-20251004-170253.jpg"; // New Logo URL
// --- END: CONFIGURATION ---

function currencyINR(n) {
  return `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// --- UPDATED BANNER URLs ---
const BANNER_SLIDES = [
    { img: "https://i.ibb.co/Y4nqRMg6/image-18.png", headline: "Truth, Dare & Situation Cards – For All Your Friends!" }, 
    { img: "https://i.ibb.co/CKYRvy6v/image.jpg", headline: "Couple Edition – Spice Up Your Next Date Night!" }, 
    { img: "https://i.ibb.co/d0S1dqFc/image-22.png", headline: "Office Anarchy – Your Desk Just Got Way More Fun!" }, 
];
// --- END: BANNER CONFIGURATION ---


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
    paymentMethod: "online", 
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Swiper Ref for Product Modal Slider
  const swiperRef = useRef(null); 

  useEffect(() => {
    const saved = localStorage.getItem("jugariii_cart_v1");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Cart update effect (for persistence and bug fix)
  useEffect(() => {
    localStorage.setItem("jugariii_cart_v1", JSON.stringify(cart));
  }, [cart]);

  // Main Banner Swiper initialization
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

  // Product Modal Swiper initialization (runs when selected is set)
  useEffect(() => {
    if (selected && window.Swiper) {
        // Find initial index of the main image in the gallery
        const initialSlideIndex = selected.gallery.findIndex(url => url === selected.img);

        swiperRef.current = new window.Swiper('.modalSwiper', {
            loop: true,
            initialSlide: initialSlideIndex >= 0 ? initialSlideIndex : 0,
            autoplay: {
                delay: 3000, // Auto-slide for product images
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next-modal',
                prevEl: '.swiper-button-prev-modal',
            },
            // Update modalImage state on slide change
            on: {
                slideChange: (s) => {
                    const activeIndex = s.realIndex;
                    setModalImage(selected.gallery[activeIndex]);
                }
            }
        });
        setModalImage(selected.img); // Set initial main image
    } else {
        swiperRef.current = null;
    }
    // Cleanup function to destroy Swiper instance
    return () => {
        if (swiperRef.current) {
            swiperRef.current.destroy(true, true);
            swiperRef.current = null;
        }
    };
  }, [selected]); // Re-run when selected product changes


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

  // --- BUG FIX: Removed implicit closing of cart on update ---
  function updateQty(pid, val) {
    const v = Math.max(0, Number(val || 0));
    setCart((c) => {
      const cur = { ...c };
      if (v === 0) delete cur[pid];
      else cur[pid] = v;
      return cur;
    });
    // Removed: setShowCart(false) or similar unintended cart closing logic
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
            ...orderInfo.formData, 
            'Payment_Status': 'Paid (Razorpay)',
            'Razorpay_ID': response.razorpay_payment_id
        };
        
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
    const { firstName, phone, address, city, state, paymentMethod } = checkout;
    
    if (!firstName || !phone || !address || !city || !state) {
      alert("Please fill in all required delivery details: Name, Phone, Address, City, and State.");
      return;
    }

    const items = Object.entries(cart).map(([pid, qty]) => {
      const p = products.find(x => x.id === pid);
      return { id: pid, title: p.title, qty, price: p.price };
    });
    
    const orderItemsString = items.map(item => 
        `${item.title} (Qty: ${item.qty}, Price: ${currencyINR(item.price)})`
    ).join(' | ');

    const isCOD = paymentMethod === 'cod';
    const finalAmount = cartFinalTotal();

    const formData = {
        'Order_Date': new Date().toLocaleString(),
        'Order_Amount': currencyINR(finalAmount),
        'Payment_Method': isCOD ? "COD" : "Online (Razorpay)",
        'COD_Fee': isCOD ? currencyINR(COD_FEE) : 'N/A',
        'Products_List': orderItemsString,
        'Customer_Name': `${checkout.firstName} ${checkout.lastName}`,
        'Mobile_Number': phone,
        'Email': checkout.email,
        'Full_Address': address,
        'City': city,
        'State': state,
    };

    if (isCOD) {
        sendOrderToFormspree({ ...formData, 'Payment_Status': 'Unpaid (COD)' });
        handleOrderPlaced(formData);
        alert(`COD Order Placed Successfully! Total: ${currencyINR(finalAmount)}. Your order details are being sent.`);
    } else {
        payWithRazorpay({ 
            amount: finalAmount, 
            items: items, 
            formData: formData
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* --- UPDATED LOGO URL --- */}
            <img src={NEW_LOGO_URL} alt="JUGARIII Logo" className="w-12 h-12 rounded-full object-cover shadow-inner border-2 border-pink-100" />
            <h1 className="text-2xl font-black text-pink-700 tracking-wider">JUGARIII</h1>
          </div>
          <nav className="flex items-center gap-4">
            <button onClick={() => setShowCart((s) => !s)} className="relative p-2 rounded-full hover:bg-pink-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5m5-5v5m6-5v5m-9 0h8" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-pink-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-md">{cartCount}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* --- START: SWIPER HERO / BANNER (Full size fix & button removed) --- */}
      <div className="relative w-full h-[300px] sm:h-[450px] md:h-[600px] overflow-hidden">
          <div className="swiper mySwiper w-full h-full">
              <div className="swiper-wrapper">
                  {BANNER_SLIDES.map((slide, index) => (
                      <div key={index} className="swiper-slide relative">
                          {/* object-cover ensures it fills the container */}
                          <img 
                              src={slide.img} 
                              alt={`Banner ${index + 1}`} 
                              className="w-full h-full object-cover object-center" 
                          />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                              <h2 className="text-white text-3xl sm:text-5xl md:text-7xl font-extrabold text-center tracking-tight drop-shadow-2xl font-serif leading-tight">
                                  {slide.headline}
                              </h2>
                              <p className="mt-3 sm:mt-6 text-white/95 text-md sm:text-2xl font-medium drop-shadow-lg">Get ready to play the ultimate party game!</p>
                              
                              {/* --- Removed 'Shop All Games' button here --- */}
                              
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section id="featured-products">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center text-pink-700 font-serif">Our Featured Game Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {products.map((p) => (
              <article 
                key={p.id} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-pink-100 cursor-pointer"
                // --- Click on card opens modal ---
                onClick={() => setSelected(p)} 
              >
                <div className="h-64 bg-gray-100 relative">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition duration-500 hover:scale-105" />
                  <span className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3">ON SALE!</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 font-serif text-slate-800">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc.substring(0, 85)}...</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {p.regularPrice && <div className="text-lg text-slate-400 line-through font-medium">{currencyINR(p.regularPrice)}</div>}
                        <div className="text-2xl font-black text-pink-600">{currencyINR(p.price)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* --- Added Buy Now button directly for quick cart add --- */}
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p.id); }} className="text-sm px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow-lg transition transform hover:scale-105">Buy Now</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="why-shop" className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-slate-700">Why shop with JUGARIII?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"> 
            <div className="bg-white p-8 rounded-xl shadow-xl text-center border-t-8 border-pink-600 transform hover:scale-[1.03] transition duration-300">
                <div className="text-2xl font-bold mb-2 text-pink-600">🚚 Fast & Reliable Shipping</div>
                <div className="text-slate-600 mt-2">Get your game packs delivered across India in just 3-5 business days.</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl text-center border-t-8 border-pink-600 transform hover:scale-[1.03] transition duration-300">
                <div className="text-2xl font-bold mb-2 text-pink-600">🔒 100% Secure Checkout</div>
                <div className="text-slate-600 mt-2">All payments are safely processed through Razorpay, India's leading payment gateway.</div>
            </div>
          </div>
        </section>
      </main>

      {/* Cart drawer */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl transform transition-transform ${showCart ? "translate-x-0" : "translate-x-full"} z-40`}>
        <div className="p-5 border-b flex items-center justify-between bg-pink-600 text-white shadow-lg">
          <h3 className="text-xl font-bold">Your Game Cart ({cartCount} Items)</h3>
          <button onClick={() => setShowCart(false)} className="text-white/80 hover:text-white transition p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-320px)] sm:h-[calc(100vh-320px)]">
          {Object.keys(cart).length === 0 && <div className="text-slate-600 text-center py-10 font-medium text-lg">Your cart is feeling lonely! Add some games.</div>}
          {Object.entries(cart).map(([pid, qty]) => {
            const p = products.find((x) => x.id === pid);
            if (!p) return null;
            return (
              <div key={pid} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <img src={p.img} alt={p.title} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                <div className="flex-1">
                  <div className="font-bold text-lg">{p.title}</div>
                  <div className="text-sm text-pink-600 font-semibold">{currencyINR(p.price)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {/* --- Input change now only updates cart state, not closing drawer --- */}
                  <input className="w-16 border rounded text-center focus:border-pink-500 py-1 text-sm font-medium" type="number" value={qty} onChange={(e) => updateQty(pid, e.target.value)} min="1" />
                  <button onClick={() => removeFromCart(pid)} className="text-xs text-red-500 hover:text-red-700 transition underline">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Checkout Section: Fields & Totals */}
        <div className="p-5 border-t absolute bottom-0 w-full bg-slate-50 shadow-inner">
          {!orderPlaced ? (
            <form onSubmit={placeOrder} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="p-3 bg-white rounded-xl shadow-sm space-y-2 border border-pink-200">
                <div className="font-bold text-sm mb-1 text-slate-700">Select Payment Option:</div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 py-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="online" 
                      checked={checkout.paymentMethod === 'online'} 
                      onChange={handleCheckoutChange}
                      className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <span className="ml-2">Online Payment (Razorpay)</span>
                  </label>
                  <label className="flex items-center text-sm font-medium text-gray-700 py-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={checkout.paymentMethod === 'cod'} 
                      onChange={handleCheckoutChange}
                      className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                    />
                    <span className="ml-2">COD <span className="text-red-600 font-bold">({currencyINR(COD_FEE)} Extra)</span></span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-sm border-b border-dashed pb-3">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{currencyINR(cartBaseTotal())}</span></div>
                {checkout.paymentMethod === 'cod' && (
                  <div className="flex justify-between text-red-600"><span>COD Fee:</span><span className="font-bold">{currencyINR(COD_FEE)}</span></div>
                )}
                <div className="flex justify-between text-xl font-black pt-2 text-pink-700"><span>Total Payable:</span><span>{currencyINR(cartFinalTotal())}</span></div>
              </div>

              
              {/* Checkout Fields */}
              <p className="text-xs text-slate-500 pt-1 font-semibold">Delivery Details:</p>
              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="First Name *" name="firstName" value={checkout.firstName} onChange={handleCheckoutChange} />
                <input className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Last Name" name="lastName" value={checkout.lastName} onChange={handleCheckoutChange} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Mobile Number *" name="phone" value={checkout.phone} onChange={handleCheckoutChange} />
                <input className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Email (Optional)" name="email" value={checkout.email} onChange={handleCheckoutChange} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="State *" name="state" value={checkout.state} onChange={handleCheckoutChange} />
                <input required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="City *" name="city" value={checkout.city} onChange={handleCheckoutChange} />
              </div>

              <textarea required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Full Address (House No, Street, Landmark) *" name="address" value={checkout.address} onChange={handleCheckoutChange} />

              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-[1.01]">
                  {checkout.paymentMethod === 'cod'? `Place COD Order (${currencyINR(cartFinalTotal())})`: `Pay Securely (${currencyINR(cartFinalTotal())})`}
                </button>
              </div>

            </form>

          ):(

            <div className="text-center text-emerald-600 font-bold p-4 bg-emerald-100 rounded-xl border border-emerald-400 shadow-md">🎉 Order Placed Successfully! We'll contact you shortly (demo).</div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-5xl w-full max-h-[95vh] rounded-2xl overflow-y-auto shadow-2xl transform transition-all duration-300">
            <div className="p-6 sm:p-8">
              <div className="flex justify-end sticky top-0 bg-white pb-3 z-30"> 
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-red-500 p-2 rounded-full hover:bg-slate-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Image Gallery Column */}
                <div>
                    {/* --- Swiper Slider for Product Gallery --- */}
                    <div className="relative h-72 sm:h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg border-4 border-pink-100">
                        <div className="swiper modalSwiper w-full h-full">
                            <div className="swiper-wrapper">
                                {selected.gallery.map((imgUrl, index) => (
                                    <div key={index} className="swiper-slide flex items-center justify-center">
                                        <img src={imgUrl} alt={`${selected.title} slide ${index}`} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                            <div className="swiper-button-next swiper-button-next-modal text-pink-600 scale-75"></div>
                            <div className="swiper-button-prev swiper-button-prev-modal text-pink-600 scale-75"></div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {selected.gallery.map((imgUrl, index) => (
                        <img
                            key={index}
                            alt={`${selected.title} thumbnail ${index}`}
                            src={imgUrl}
                            className={`min-w-[70px] h-20 object-cover rounded-xl cursor-pointer border-3 transition-all shadow-md ${modalImage === imgUrl ? 'border-pink-600' : 'border-slate-300 hover:border-pink-300'}`}
                            onClick={() => {
                                setModalImage(imgUrl);
                                // Go to the corresponding slide when thumbnail is clicked
                                if (swiperRef.current) {
                                    swiperRef.current.slideToLoop(index);
                                }
                            }}
                        />
                    ))}
                    </div>
                </div>

                {/* Details Column */}
                <div className="md:border-l md:pl-8 pt-4 md:pt-0">
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-pink-600 font-serif leading-tight">{selected.title}</h3>
                    
                    <div className="mt-4 flex items-center gap-4 border-b pb-4">
                        {selected.regularPrice && <div className="text-xl font-medium text-slate-400 line-through">{currencyINR(selected.regularPrice)}</div>}
                        <div className="text-3xl font-black text-slate-900">{currencyINR(selected.price)}</div>
                    </div>
                    
                    <p className="mt-5 text-slate-700 leading-relaxed text-lg">{selected.desc}</p>
                    
                    {/* --- How to Play Section --- */}
                    <div className="mt-8 p-4 bg-pink-50 rounded-xl border border-pink-200">
                        <h4 className="text-xl font-bold mb-3 text-pink-700">
                            How to Play (Players: {HOW_TO_PLAY[selected.id].players})
                        </h4>
                        <ul className="list-disc list-inside text-base text-slate-700 space-y-2 pl-4">
                            {HOW_TO_PLAY[selected.id].details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                    {/* --- End How to Play Section --- */}

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <button onClick={() => { addToCart(selected.id); setSelected(null); }} className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xl font-bold text-lg transition transform hover:scale-[1.02]">
                            Add to Cart
                        </button>
                        <button onClick={() => setSelected(null)} className="px-8 py-3 border-2 border-slate-500 rounded-xl hover:bg-slate-100 transition font-medium text-lg">
                            Back to Store
                        </button>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 py-8 text-center text-sm text-slate-500 border-t bg-white">
          <p className="text-lg font-bold text-pink-600 mb-2">JUGARIII</p>
          <div className="flex justify-center items-center gap-4 mb-3">
            <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition">
                {/* Simple Instagram Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.716 0 3.056.012 4.122.06c1.077.051 1.791.218 2.428.465.66.257 1.159.597 1.636 1.075.479.479.82 1.018 1.075 1.636.248.637.414 1.35.465 2.428.048 1.066.06 1.406.06 4.122s-.012 3.056-.06 4.122c-.051 1.077-.218 1.791-.465 2.428-.257.66-.597 1.159-1.075 1.636-.479.479-1.018.82-1.636 1.075-.637.248-1.35.414-2.428.465-1.066.048-1.406.06-4.122.06s-3.056-.012-4.122-.06c-1.077-.051-1.791-.218-2.428-.465-.66-.257-1.159-.597-1.636-1.075-.479-.479-.82-1.018-1.075-1.636-.248-.637-.414-1.35-.465-2.428-.048-1.066-.06-1.406-.06-4.122s.012-3.056.06-4.122c.051-1.077.218-1.791.465-2.428.257-.66.597-1.159 1.075-1.636.479-.479 1.018-.82 1.636-1.075.637-.248 1.35-.414 2.428-.465C8.944 2.012 9.284 2 12 2zm0 2.218c-2.616 0-2.924.01-3.951.058-1.026.049-1.666.216-2.126.398-.5.195-.889.467-1.282.86-.39.39-.665.782-.86 1.282-.182.46-.35 1.1-.398 2.126-.048 1.027-.058 1.335-.058 3.951s.01 2.924.058 3.951c.048 1.026.216 1.666.398 2.126.195.5.467.889.86 1.282.39.39.782.665 1.282.86.46.182 1.1.35 2.126.398 1.027.048 1.335.058 3.951.058s2.924-.01 3.951-.058c1.026-.048 1.666-.216 2.126-.398.5-.195.889-.467 1.282-.86.39-.39.665-.782.86-1.282.182-.46.35-1.1.398-2.126.048-1.027.058-1.335.058-3.951s-.01-2.924-.058-3.951c-.048-1.026-.216-1.666-.398-2.126-.195-.5-.467-.889-.86-1.282-.39-.39-.782-.665-1.282-.86-.46-.182-1.1-.35-2.126-.398-1.027-.048-1.335-.058-3.951-.058zm0 3.238c-3.176 0-5.75 2.574-5.75 5.75s2.574 5.75 5.75 5.75 5.75-2.574 5.75-5.75-2.574-5.75-5.75-5.75zm0 9.262c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5zm7.398-9.98c0 .546.444.99.99.99h.012c.546 0 .99-.444.99-.99s-.444-.99-.99-.99h-.012c-.546 0-.99.444-.99.99z"/></svg>
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} JUGARIII. All rights reserved.</p>
          <p className="mt-1 text-xs">Jugarri Store | Developed by a friend.</p>
      </footer>
    </div>
  );
}
