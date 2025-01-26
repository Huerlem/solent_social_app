import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCOFtXW4r1NhIrxeTqhCDPpDt_l6pVWwLI",
  authDomain: "meet-up-app-64da2.firebaseapp.com",
  projectId: "meet-up-app-64da2",
  storageBucket: "meet-up-app-64da2.firebasestorage.app", 
  messagingSenderId: "1005874621623",
  appId: "1:1005874621623:web:201736654c020c6d28f132",
  measurementId: "G-8KDZE4FWSP",
  privateKey: process.env.FIREBASE_PRIVATE_KEY
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on client side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize other Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app, 'gs://meet-up-app-64da2.firebasestorage.app');



export { app, analytics, auth, db, storage };