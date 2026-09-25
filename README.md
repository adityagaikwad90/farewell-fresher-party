# MCA Fresher & Farewell Celebration 2026 Portal 🎉

A modern, responsive, and animated celebration registration web application built for the **MCA Fresher & Farewell Celebration 2026** ("One Department. Two Batches. One Celebration. Countless Memories.").

Built with **React**, **Node.js + Express**, and **Firebase** (with built-in local persistent fallback), featuring interactive celebration animations, confetti blasts, digital attendee pass generation, and an **Admin Management Dashboard**.

---

## 🚀 Features

- **Celebration Hero & Invitation**:
  - Grand festive visual theme with aurora glowing gradients and interactive particle canvas.
  - Heartwarming welcome letter uniting MCA 1st Year juniors and 2nd Year seniors.
  - Slogan banner: *"🔥 One Department. Two Batches. One Celebration. Countless Memories. 🔥"*
  - Fixed entry fee card: **₹600** (exact amount per student).
  - Direct pulse-animated **WhatsApp Community button** with instant invite link.
- **Registration Form**:
  - Full Name (required)
  - Contact Number (with phone validation)
  - Email ID (with format validation)
  - Academic Year (Interactive selection for 1st Year & 2nd Year)
  - Division (Interactive selection for Division A & B)
  - Fixed Entry Fee: ₹600
  - Talent & Event Registration (Singing 🎤, Dancing 💃, Stand Up Comedy 🎭, or custom Other performance)
  - "What would you like to see at the Fresher & Farewell Party?"
  - "Suggest a fun activity/game for the party."
  - Embedded WhatsApp group prompt
  - Clear Form & Submit buttons
- **Celebration Feedback**:
  - Full-screen confetti cannon on submission
  - Digital Gala Entry Pass card with unique Pass ID
  - Download / Print Pass feature
- **Comprehensive Admin Panel (`/admin` / Organizers Portal)**:
  - Secure passcode gate (default: `mca2026admin`)
  - Live metric statistics: Total Registrations, Division A vs Division B distribution, Talent breakdown, and Fee pool estimation
  - Structured response table with formatted timestamps, divisions, talents, contact info
  - Detailed response modal for reading wishes and game suggestions
  - Instant **CSV / Excel export** for department records
  - Delete entry action with confirmation
- **Dual Database Architecture**:
  - **Firebase Firestore ready**: automatically connects when credentials are present.
  - **Zero-config local fallback**: operates immediately out-of-the-box using persistent storage (`server/data/responses.json`).

---

## 🛠️ How to Run Locally

### 1. Start Backend API Server
```bash
cd server
npm start
```
*Runs on `http://localhost:5001`*

### 2. Start Frontend React Application
In a separate terminal:
```bash
cd client
npm run dev
```
*Runs on `http://localhost:3000`*

---

## 🔐 Admin Portal Access
- Click **"Admin Portal"** on the top navigation bar or the link in the footer.
- Default Admin Passcode: `mca2026admin` (You can change this in `server/.env`).

---

## 🔥 Connecting to Firebase Cloud Firestore

The application works right now without any setup! When you are ready to connect your live Firebase project:

1. Go to your [Firebase Console](https://console.firebase.google.com/) -> Project Settings -> **Service accounts**.
2. Click **"Generate new private key"** and download the JSON file.
3. Rename the file to `serviceAccountKey.json` and place it in the `server/` folder:
   ```
   server/serviceAccountKey.json
   ```
   *(Or alternatively, set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `server/.env`).*
4. Restart the server: it will automatically detect the key and show `🔥 Connected to Firebase Cloud Firestore!`.
