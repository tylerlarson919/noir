"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

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
      orderBy("createdAt", "desc")
    );
    
    const unsubOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersArray);
    });
    
    return () => unsubOrders();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="mx-4 md:mx-16 mt-24">
      <div className="mb-4">
        <button
          onClick={async () => {
            await logout();
            router.push("/account/login");
          }}
          className="text-sm text-gray-500 flex items-center cursor-pointer mb-10"
        >
          <span className="mr-2">←</span> LOGOUT
        </button>
      </div>

      <h1 className="text-2xl font-medium mb-4">
        {user.displayName ? user.displayName.split(" ")[0] : "USER DASHBOARD"}
      </h1>
      <p className="text-gray-600 mb-10">
        View all your orders and manage your account information.
      </p>

      <div className="flex mb-20">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
            <h2>ORDERS</h2>
            <button
              onClick={() => (window.location.href = "/track")}
              className="w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm text-sm font-medium"
            >
              TRACK ORDER
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <p className="font-medium">
                      Order #{order.id ? order.id.substring(3, 9) : (index + 1)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {order.date || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {order.status || "Processing"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-8 text-sm">
                You haven&apos;t placed any orders yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
