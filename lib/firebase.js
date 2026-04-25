import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2IkyQxPNUBs6x4vI_v4bAo0BrpgqTqho",
  authDomain: "deeplink-menu.firebaseapp.com",
  projectId: "deeplink-menu",
  storageBucket: "deeplink-menu.firebasestorage.app",
  messagingSenderId: "147456343708",
  appId: "1:147456343708:web:e9f8ba1a92657061c8b759",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);