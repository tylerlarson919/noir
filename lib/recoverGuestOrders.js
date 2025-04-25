// src/lib/recoverGuestOrders.js
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export async function recoverGuestOrders(userId, email) {
  if (!userId || !email) return [];
  
  try {
    // Look up any guest orders with this email
    const emailIndexRef = doc(db, `users/guest-user/email-index/${email.toLowerCase()}`);
    const indexDoc = await getDoc(emailIndexRef);
    
    if (!indexDoc.exists() || !indexDoc.data().orders) {
      return [];
    }
    
    const orderIds = indexDoc.data().orders;
    const batch = writeBatch(db);
    const recoveredOrders = [];
    
    // Transfer each order to the user's account
    for (const orderId of orderIds) {
      const guestOrderRef = doc(db, `users/guest-user/orders/${orderId}`);
      const orderDoc = await getDoc(guestOrderRef);
      
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        
        // Update the order with the real user ID
        const updatedOrder = {
          ...orderData,
          userId: userId,
          recoveredFromGuest: true
        };
        
        // Add to user's orders
        const userOrderRef = doc(db, `users/${userId}/data/orders/${orderId}`);
        batch.set(userOrderRef, updatedOrder);
        
        // Update main orders collection
        const mainOrderRef = doc(db, `orders/${orderId}`);
        batch.set(mainOrderRef, updatedOrder, {merge: true});
        
        // Optionally delete from guest user
        // batch.delete(guestOrderRef);
        
        recoveredOrders.push(updatedOrder);
      }
    }
    
    await batch.commit();
    return recoveredOrders;
  } catch (error) {
    console.error("Error recovering guest orders:", error);
    return [];
  }
}