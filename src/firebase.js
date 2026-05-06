// Inicialización de Firebase. getToken y onMessage se re-exportan aquí para que los
// componentes no necesiten importar firebase/messaging directamente (evita instancias duplicadas).
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBW6kfH-zcl6vrflZu4bURg7nZDtxdlMRY",
  authDomain: "udlaplife.firebaseapp.com",
  projectId: "udlaplife",
  storageBucket: "udlaplife.firebasestorage.app",
  messagingSenderId: "275979284252",
  appId: "1:275979284252:web:0b52dbf04f4a874fe814d9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
export { getToken, onMessage };
