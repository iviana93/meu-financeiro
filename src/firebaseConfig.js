import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWzJk7Cm7iVs6IL-p3kclRrGu1-KqmWqY",
  authDomain: "appgastos-43a83.firebaseapp.com",
  projectId: "appgastos-43a83",
  storageBucket: "appgastos-43a83.firebasestorage.app",
  messagingSenderId: "392567795342",
  appId: "1:392567795342:web:952f6234411b339adde3df",
  measurementId: "G-RQWG5XHYSH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para usar no App.js
export const db = getFirestore(app);