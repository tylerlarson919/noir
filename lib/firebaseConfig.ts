// firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAEaPmZ3vpEhH6d0bh63UvsYC0yQ0yKws",
  authDomain: "noir-clothing.firebaseapp.com",
  projectId: "noir-clothing",
  storageBucket: "noir-clothing.firebasestorage.app",
  messagingSenderId: "212228381641",
  appId: "1:212228381641:web:d4687085e1b6eae4066618",
  measurementId: "G-V0YYRWGTDD",
};

// Initialize Firebase app (singleton)
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Exports
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
