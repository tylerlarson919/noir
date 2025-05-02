"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {ScrollShadow} from "@heroui/scroll-shadow";

export default function AccountPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    // Use collection query instead of a specific document
    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("shipping.updatedAt", "desc")
    );
    
    const unsubOrders = onSnapshot(
     ordersQuery,
     (querySnapshot) => {
      const ordersArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersArray);
        },
        (err) => console.error("orders fetch failed:", err) // log missing‐index errors
      );
    
    return () => unsubOrders();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="mx-4 md:mx-16 mt-24 flex flex-col items-center relative">
      <div className="absolute top-0 left-0">
        <button
          onClick={async () => {
            await logout();
            router.push("/account/login");
          }}
          className="text-sm text-gray-600 dark:text-textaccent flex items-center cursor-pointer"
        >
          <span className="mr-2">←</span> LOGOUT
        </button>
      </div>
      <div className="flex flex-col w-full md:w-[90%] lg:w-2/3 mt-12">
        <h1 className="text-2xl font-medium mb-4">
          {user.displayName ? user.displayName.split(" ")[0] : "USER DASHBOARD"}
        </h1>
        <p className="text-gray-600 dark:text-textaccent mb-10">
          View all your orders and manage your account information.
        </p>

        <div className="flex mb-20">
          <div className="w-full">
            <div className="flex justify-between items-center mb-4 text-2xl font-medium">
              <h2>Orders</h2>
              <button
                onClick={() => (window.location.href = "/track")}
                className="w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm text-sm font-medium"
              >
                TRACK ORDER
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-textaccent/40 pt-6">
            <ScrollShadow className="w-full h-[662px]">
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order, index) => (
                      <div key={index} className="border border-gray-200 dark:border-textaccent/40 rounded p-6">
                        <div className="flex justify-between items-center mb-1">
                          <h2 className="text-xl font-medium">Order #{order.id ? order.id.substring(3, 9) : (index + 1)}</h2>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">
                            {order.shipping?.status || order.status || "Processing"}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-textaccent mb-1">
                          {
                            order.orderDate ? 
                              (() => {
                                try {
                                  const date = new Date(order.orderDate);
                                  return date.toLocaleDateString('en-US', {
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric'
                                  });
                                } catch (err) {
                                  console.error("Date parsing error:", err);
                                  return order.orderDate;
                                }
                              })() : 
                              "N/A"
                          }
                        </p>
                        <div className="divide-y">
                          {order.items && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="py-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-16 h-16 mr-4 bg-gray-100 rounded-md overflow-hidden">
                                  <img
                                    src={item.image || "/placeholder.png"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-gray-600 dark:text-textaccent">
                                    {item.size} / {item.color?.name || item.color}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-textaccent">Quantity: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium">${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4 mt-4 border-gray-200 dark:border-textaccent/40">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Total</h3>
                            <p className="text-lg font-bold">
                              ${(order.amount?.total || order.amount?.subtotal || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-textaccent mb-8 text-sm">
                    You haven&apos;t placed any orders yet.
                  </p>
                )}
              </ScrollShadow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
