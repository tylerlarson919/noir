"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import AddressModal from "@/components/account/AddressModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function AccountPage() {
  const { user, logout, loading } = useAuth();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "data", "address");
    const unsub = onSnapshot(ref, (snap) => {
      setAddress(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ordersRef = doc(db, "users", user.uid, "data", "orders");
    const unsubOrders = onSnapshot(ordersRef, (snap) => {
      if (snap.exists()) {
        const ordersData = snap.data();
        // Convert orders object to array if needed
        const ordersArray = ordersData.orders || [];
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
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
          className="text-sm text-gray-500 flex items-center cursor-pointer"
        >
          <span className="mr-2">←</span> LOGOUT
        </button>
      </div>

      <h1 className="text-2xl font-medium mb-4">YOUR ACCOUNT</h1>
      <p className="text-gray-600 mb-10">
        View all your orders and manage your account information.
      </p>

      <div className="flex flex-col md:flex-row gap-10 mb-20">
        <div className="w-full md:w-2/3">
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
                      Order #{order.id || index + 1}
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
                You haven't placed any orders yet.
              </p>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
            <h2>PRIMARY ADDRESS</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm text-sm font-medium"
            >
              MANAGE
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            {address ? (
              <>
                <p className="mb-1">{address.row1}</p>
                <p className="mb-1 text-gray-600 text-sm">
                  {address.city}, {address.zip}, {address.country}
                </p>
                {address.notes && (
                  <p className="mb-8 text-gray-600 text-sm">{address.notes}</p>
                )}
              </>
            ) : (
              <p className="text-gray-600 mb-8">No address saved</p>
            )}
          </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal onClose={() => setShowAddressModal(false)} />
      )}
    </div>
  );
}
