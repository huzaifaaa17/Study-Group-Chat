import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCFilF1fPUj8Z7JeZfAOEjXWQY_It5pulE",
  authDomain: "studygroupchat-by-hayze.firebaseapp.com",
  projectId: "studygroupchat-by-hayze",
  storageBucket: "studygroupchat-by-hayze.firebasestorage.app",
  messagingSenderId: "798455292540",
  appId: "1:798455292540:web:bb6a8d3535286e00d61ff9",
  measurementId: "G-E1NHFSRVEB",
  databaseURL: "https://studygroupchat-by-hayze-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);

// Initialize messaging conditionally
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch((err) => {
  console.error('Messaging not supported:', err);
});

export { messaging };
export default app;