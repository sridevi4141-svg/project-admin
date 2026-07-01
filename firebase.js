// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD70TIQhs33bxqO9zEdyMzx4BVQLLFXBuw",
  authDomain: "billing-ststem.firebaseapp.com",
  projectId: "billing-ststem",
  storageBucket: "billing-ststem.firebasestorage.app",
  messagingSenderId: "926181664447",
  appId: "1:926181664447:web:7da181236d73739e3d880a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore Database
const db = getFirestore(app);

// Export Database
export { db };