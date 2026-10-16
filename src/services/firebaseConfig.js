// Firebase Configuration and Integration Adapter
// Reads from Vite environment variables or localStorage custom configuration

export const defaultFirebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBuddDUVqcdoK3lEDlHLHuqqDP0R818prA",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "traveltales-4a3e4.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "traveltales-4a3e4",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "traveltales-4a3e4.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "280323348870",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:280323348870:web:5e9df2ee3c9585acaeb407",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-3QRD6P7008"
};

const STORAGE_KEY = 'traveltales_firebase_config';

export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.apiKey !== "YOUR_API_KEY_HERE") {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading Firebase config from storage:', e);
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving Firebase config:', e);
    return false;
  }
}

export function isFirebaseConnected() {
  const cfg = getFirebaseConfig();
  return Boolean(cfg && cfg.apiKey && cfg.apiKey !== "YOUR_API_KEY_HERE" && cfg.projectId);
}
