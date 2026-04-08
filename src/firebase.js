import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDwtEOtmdFuUniuArKjGP2Wiwg31JERt-0",
  authDomain: "notediaz-fbe8d.firebaseapp.com",
  projectId: "notediaz-fbe8d",
  storageBucket: "notediaz-fbe8d.firebasestorage.app",
  messagingSenderId: "462267453601",
  appId: "1:462267453601:web:567f7ca1c789e8249aa0e0",
  measurementId: "G-F1VHXWH07Bq"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
export { db, analytics };