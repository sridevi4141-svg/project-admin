// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "billing-ststem.firebaseapp.com",
    projectId: "billing-ststem",
    storageBucket: "billing-ststem.firebasestorage.app",
    messagingSenderId: "926181664447",
    appId: "1:926181664447:web:7da181236d73739e3d880a"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };