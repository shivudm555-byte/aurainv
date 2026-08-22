# 🔥 Antigravity Fintech — 5-Minute Firebase Setup Guide

Use Firebase as your 100% serverless backend (Auth, Firestore Real-time Database, and Hosting).

---

## ⚡ Step 1: Create a Free Firebase Project (2 Minutes)

1. Go to **[https://console.firebase.google.com](https://console.firebase.google.com)** and sign in with your Google account.
2. Click **Create a project** (Name it: `Antigravity Fintech`).
3. Turn off Google Analytics (optional) and click **Create Project**.

---

## 🔑 Step 2: Enable Auth & Firestore Database (2 Minutes)

1. **Enable Authentication**:
   - In the Firebase Console left menu, click **Build → Authentication**.
   - Click **Get Started**.
   - Under **Sign-in method**, enable:
     - **Email/Password** (Turn on and click Save).
     - **Google** (Optional, turn on and click Save).
2. **Enable Firestore Database**:
   - In the left menu, click **Build → Firestore Database**.
   - Click **Create Database**.
   - Choose **Start in test mode** and click **Enable**.

---

## 📋 Step 3: Copy Your Keys to `firebase-config.js` (1 Minute)

1. In Firebase Console, click the **Project Settings** (Gear icon ⚙️ at the top left).
2. Scroll down to **Your apps**, click the **Web icon (`</>`)**, and register your app (e.g. `Antigravity Web`).
3. Firebase will show your `firebaseConfig` keys like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-app-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
4. Open the file `firebase/firebase-config.js` in this folder and paste your keys there!

---

## 🚀 Step 4: Run the App Instantly

You have 3 easy ways to run and view the app:

### Option A: Direct Browser Preview (Easiest)
Just double-click `firebase/index.html` or open it in your browser! It will immediately connect to Firebase.

### Option B: Free Firebase Hosting (1 Command)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
Your app will be live globally on a free URL like:  
`https://your-project-id.web.app`

### Option C: Convert to Android APK
Use Capacitor or Bubblewrap pointing to your Firebase web URL to generate your `.apk` and publish to Google Play Store!
