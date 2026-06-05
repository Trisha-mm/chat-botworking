import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCty9cWiJeLENWvViylsOdwmXTjIla-Q7w",
  authDomain: "serenity-1e9e5.firebaseapp.com",
  projectId: "serenity-1e9e5",
  storageBucket: "serenity-1e9e5.firebasestorage.app",
  messagingSenderId: "582139876928",
  appId: "1:582139876928:web:fdc353cfd7522caa25f1a5",
  measurementId: "G-L9HX3KR9ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;


