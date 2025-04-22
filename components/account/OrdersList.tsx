"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/context/AuthContext";

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("uid", "==", user.uid));
    getDocs(q).then((snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  return (
    <ul className="space-y-2">
      {orders.map((o) => (
        <li key={o.id} className="p-4 border rounded">
          <p>Order #{o.id}</p>
          <p>{o.status}</p>
        </li>
      ))}
      {orders.length === 0 && <p>No orders yet.</p>}
    </ul>
  );
}
