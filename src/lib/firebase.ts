import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrC6G0kx0P4_HKSb8Inbde0yVS2YfuFhM",
  authDomain: "mindful-rag.firebaseapp.com",
  projectId: "mindful-rag",
  storageBucket: "mindful-rag.firebasestorage.app",
  messagingSenderId: "495601596814",
  appId: "1:495601596814:web:83be0a2f48fb62a9750cdf",
  measurementId: "G-J7TSP49H03",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope("email");
googleProvider.addScope("profile");

export default app;
