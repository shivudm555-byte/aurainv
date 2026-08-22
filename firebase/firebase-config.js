// ==========================================================================
// Firebase Configuration & SDK Initialization (Modular Firebase v10 CDN)
// ==========================================================================

// NOTE: Replace these values with your own Firebase project keys from
// Firebase Console (https://console.firebase.google.com) -> Project Settings -> Your Apps -> Web App
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyReplaceWithYours1234567890",
  authDomain: "antigravity-fintech.firebaseapp.com",
  projectId: "antigravity-fintech",
  storageBucket: "antigravity-fintech.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Export config for application use
window.FIREBASE_CONFIG = firebaseConfig;
