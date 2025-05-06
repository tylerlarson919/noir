"use client";
import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { addToast } from "@heroui/toast";
import { db, auth } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import {ScrollShadow} from "@heroui/scroll-shadow";
import { select } from "@heroui/theme";


interface Order extends DocumentData {
  id: string;
  trackingNumber: string;
  shipping: {
    updatedAt: any; // Firestore Timestamp
    status: string;
  };
  orderDate: any;
  items: any[];
  amount: {
    total: number;
    subtotal: number;
  };
}

export default function TrackOrderPage() {
  const [section, setSection] = useState<"email" | "orders" | "tracking">(
    auth.currentUser ? "orders" : "email"
  );
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authChecked, setAuthChecked] = useState(false);
  const [direction, setDirection] = useState(1);
  const emailRef = useRef<HTMLInputElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const sectionsOrder = ["email", "orders", "tracking"] as const;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setSection(u ? "orders" : "email");
      if (u) fetchOrdersForUser(u.uid);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);


  const handleOrderFromUrl = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Query for the specific order
      const orderRef = collection(db, "orders");
      const q = query(orderRef, where("id", "==", orderId));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        addToast({
          title: "Order Not Found",
          description: "The requested order could not be found.",
          color: "danger",
        });
        setSection("email");
        return;
      }
      
      // Get the order data
      const orderData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Order;
      
      // Set the order and navigate directly to tracking
      setOrders([orderData]);
      setSelectedOrder(orderData);
      setSection("tracking");
      
      // Fetch tracking info
      handleSelectOrder(orderData);
    } catch (err) {
      console.error('Error fetching order from URL parameter:', err);
      addToast({
        title: "Error",
        description: "Failed to load the specified order.",
        color: "danger",
      });
      setSection("email");
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (newSection: "email" | "orders" | "tracking") => {
    const fromIdx = sectionsOrder.indexOf(section);
    const toIdx   = sectionsOrder.indexOf(newSection);
    setDirection(toIdx > fromIdx ? 1 : -1);
    setSection(newSection);
  };

  // New method for authenticated users, using onSnapshot for real-time updates
  const fetchOrdersForUser = (userId: string) => {
    console.log('Setting up orders listener for user', userId);
    setLoading(true);
    
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("shipping.updatedAt", "desc")
      );
      
      console.log('Creating orders subscription');
      const unsubscribe = onSnapshot(
        ordersQuery,
        (querySnapshot) => {
          console.log('Orders data received', { count: querySnapshot.docs.length });
          const ordersArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];
          
          if (ordersArray.length === 0) {
            console.log('No orders found for user');
            addToast({
              title: "No Orders Found",
              description: "No orders found for your account.",
              color: "warning",
            });
            return;
          }
          
          setOrders(ordersArray);
          setSection("orders");
          setLoading(false);
        },
        (error) => {
          console.error('Error in orders subscription:', error);
          addToast({ 
            title: "Error", 
            description: "Failed to fetch orders.", 
            color: "danger" 
          });
          setLoading(false);
        }
      );
      
      // Store the unsubscribe function somewhere if needed for cleanup
      return unsubscribe;
    } catch (err) {
      console.error('Error setting up orders query:', err);
      setLoading(false);
      addToast({ 
        title: "Error", 
        description: "Failed to set up orders query.", 
        color: "danger" 
      });
    }
  };

  // Keep the one-time fetch method for email-based lookups
  const fetchOrdersByEmail = async (email: string) => {
    setDirection(1);
    console.log('Fetching orders by email', email);
    setLoading(true);
    
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("email", "==", email),
        orderBy("shipping.updatedAt", "desc")
      );
      
      console.log('Executing Firestore query for email');
      const snap = await getDocs(q);
      
      console.log('Raw query results:', snap.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })));
      
      const list = snap.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Order[];
      
      console.log('Orders processed:', { 
        count: list.length,
        fields: list.length > 0 ? Object.keys(list[0]) : []
      });
      
      if (!list.length) {
        console.log('No orders found for email');
        addToast({
          title: "No Orders Found",
          description: "No orders found for this email address.",
          color: "warning",
        });
        setSection("email");
        setLoading(false);
        return;
      }
      
      setOrders(list);
      setSection("orders");
    } catch (err) {
      console.error('Error fetching orders by email:', err);
      if (err instanceof Error) {
        console.error('Error details:', { 
          message: err.message,
          stack: err.stack
        });
      }
      addToast({ 
        title: "Error", 
        description: "Failed to fetch orders.", 
        color: "danger" 
      });
      setSection("email");
    } finally {
      setLoading(false);
      console.log('Email-based orders fetch completed');
    }
  };

  const handleSubmitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailVal = emailRef.current?.value || "";
    console.log('Email form submitted', { email: emailVal });
    
    if (!emailVal.includes("@")) {
      console.log('Invalid email format');
      addToast({ 
        title: "Invalid Email", 
        description: "Please enter a valid email.", 
        color: "danger" 
      });
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }
    setEmailError(false);
    setShowRecaptcha(true);
    console.log('Showing reCAPTCHA');
  };

  const onRecaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA token received:', !!token);
    if (!token) return;
    
    setShowRecaptcha(false);
    const email = emailRef.current?.value || "";
    console.log('Email verified, fetching orders for:', email);
    setDirection(1);
    fetchOrdersByEmail(email);
    recaptchaRef.current?.reset();
  };

  const handleSelectOrder = async (order: Order) => {
    // 1) pick order & reset
    setSelectedOrder(order);
    const status = order.shipping.status.toLowerCase();
  
    // 2) if still processing/preparing, skip USPS call
    if (status === "processing" || status === "preparing") {
      setTrackingInfo(null);
      setLoading(false);
      navigateTo("tracking");
      return;
    }
  
    // 3) otherwise, fetch USPS
    setLoading(true);
    try {
      const res = await fetch("/api/usps-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: order.trackingNumber }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
  
      setTrackingInfo(data);
      navigateTo("tracking");
    } catch (err) {
      console.error(err);
      addToast({
        title: "Error",
        description: "Failed to fetch tracking information.",
        color: "danger",
      });
      // stay on orders if USPS fails
      navigateTo("orders");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format dates from timestamps
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      // Handle both Firestore timestamps and string dates
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.error("Date parsing error:", err);
      return "N/A";
    }
  };

  const steps = ["Processing", "Preparing", "Shipping", "Delivered"];
  const currentStepIndex = selectedOrder?.shipping.status === "processing"
    ? 0
    : selectedOrder?.shipping.status === "preparing"
      ? 1
      : trackingInfo?.statusIndex ?? 0;


  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-[600px] max-w-lg mx-auto mt-20 sm:mt-24 relative">
      <AnimatePresence mode="wait">
        {section === "email" && !user && (
          <motion.div
            key="email"
            initial  = {{ x: 300 * direction,   opacity: 0 }}
            animate  = {{ x: 0,                  opacity: 1 }}
            exit     = {{ x: -300,  opacity: 0 }}
            transition = {{ type: "tween", duration: 0.3 }}
            className="absolute inset-2 sm:inset-0"
          >
            <div className="absolute inset-2 sm:inset-0">
              <h1 className="text-xl font-bold mb-3">Track Your Order</h1>
              <form onSubmit={handleSubmitEmail}>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email used for order"
                  className={`w-full p-3 mb-4 rounded placeholder:text-sm focus:outline-none transition-all border ${
                    emailError ? "border-red-500" : "border-gray-300 focus:border-gray-500"
                  }`}
                  onFocus={() => emailError && setEmailError(false)}
                />
                {showRecaptcha ? (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={onRecaptchaChange}
                  />
                ) : (
                  <button className="bg-black text-white py-2 px-4 rounded">
                    {loading ? "Loading..." : "Verify Email"}
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}

        {section === "orders" && (
          <motion.div
            key="orders"
            initial  = {{ x: 300 * direction,   opacity: 0 }}
            animate  = {{ x: 0,                  opacity: 1 }}
            exit     = {{ x: -300,  opacity: 0 }}
            transition = {{ type: "tween", duration: 0.3 }}
            className="absolute inset-2 sm:inset-0"
          >
            <div className="absolute inset-2 sm:inset-0">
              <h2 className="text-xl font-bold mb-3">Your Orders</h2>
              {loading ? (
                <p>Loading your orders...</p>
              ) : (
                <ScrollShadow className="w-full h-[500px] sm:h-[500px]">
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <button 
                      key={order.id} 
                      className="border border-gray-200 dark:border-textaccent/40 rounded p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => handleSelectOrder(order)}
                    >
                      {/* header: title + total */}
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium">
                          Order #{order.id?.substring(3, 9) ?? 'N/A'}
                        </h2>
                        <p className="text-lg font-bold">
                          ${(order.amount?.total ?? order.amount?.subtotal ?? 0).toFixed(2)}
                        </p>
                      </div>
                    
                      {/* sub-header: date, status + tracking */}
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-gray-600 dark:text-textaccent">
                          {formatDate(order.orderDate || order.shipping?.updatedAt)}
                        </p>
                        <div className="py-2">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs capitalize">
                              {order.shipping?.status ?? "Processing"}
                            </span>
                          </div>
                        </div>
                      </div>
                    
                      {/* items row */}
                      <div className="divide-y">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                              <img
                                src={item.image || "/placeholder.png"}
                                alt={item.name}
                                className="w-12 h-auto object-cover"
                              />
                            </div>
                            {/* if you have more info per item, drop it here */}
                          </div>
                        ))}
                      </div>
                    </button>                    
                    ))}
                  </div>
                </ScrollShadow>
              )}
            </div>
          </motion.div>
        )}

        {section === "tracking" && selectedOrder && (
          <motion.div
            key="tracking"
            initial  = {{ x: 300 * direction,   opacity: 0 }}
            animate  = {{ x: 0,                  opacity: 1 }}
            exit     = {{ x: 300 ,  opacity: 0 }}
            transition = {{ type: "tween", duration: 0.3 }}
            className="absolute inset-2 sm:inset-0"
          >
            <div className="absolute inset-2 sm:inset-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  <button 
                    onClick={() => navigateTo("orders")}
                    className="mr-2 p-1 rounded hover:bg-gray-100"
                    aria-label="Back to orders"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold">Order #{selectedOrder.id?.substring(3, 9) ?? 'N/A'}</h2>
                </div>
                <div className="py-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs capitalize">
                      {selectedOrder.shipping?.status ?? "Processing"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mb-4">
                {steps.map((step, idx) => (
                  <div key={step} className="text-center flex-1">
                    <div
                      className={`mx-auto mb-2 size-8 rounded-full border-2 flex items-center justify-center ${
                        idx <= currentStepIndex
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className={`text-xs ${idx <= currentStepIndex ? "text-green-500" : "text-gray-400"}`}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
              {["processing","preparing"].includes(selectedOrder.shipping.status.toLowerCase()) ? (
                <p className="text-sm text-center">Tracking will be available once your order ships.</p>
              ) : loading ? (
                <p className="text-sm text-center">Loading tracking information...</p>
              ) : trackingInfo ? (
                <div>
                  <p>Last updated: {new Date(trackingInfo.lastUpdate).toLocaleString()}</p>
                  <p>Current status: {steps[currentStepIndex]}</p>
                  
                  {trackingInfo.details && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Tracking Details</h3>
                      <div className="border rounded p-3 bg-gray-50">
                        <p>{trackingInfo.details}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <p>Order Date: {formatDate(selectedOrder.orderDate)}</p>
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <div className="mt-2">
                        <p>Items: {selectedOrder.items.length}</p>
                        <p>Total: ${(selectedOrder.amount?.total || 0).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigateTo("orders")}
                    className="mt-6 bg-gray-200 text-gray-800 py-2 px-4 rounded"
                  >
                    Back to Orders
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}