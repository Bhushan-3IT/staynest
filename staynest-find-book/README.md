# 🏠 StayNest - PG Finder Platform for SGGS Nanded

## 📌 Project Overview

StayNest is a **MERN Stack** platform designed to help **SGGS Nanded** students find verified PGs and hostels near their college. It connects students, landlords, and college admin in a trusted ecosystem.

---

## ✨ Features

### 🎓 For Students (SGGS Students Only)
- 🔍 Search and browse verified PGs near SGGS Nanded
- 🗺️ View property location and route from SGGS on Google Maps
- 🛡️ AI-powered Safety Score for each location
- 📍 Distance and walking time from college
- 📝 Leave reviews and rate properties
- ✅ SGGS email verification (@sggs.ac.in)

### 🏠 For Landlords
- 📋 List properties with photos and details
- 📍 Pin property location on interactive map
- ✅ Manage booking requests (accept/reject)
- 📊 Track earnings and bookings

### 🛡️ For Admin (SGGS Admin)
- ✅ Verify landlords and properties
- 📊 Safety Dashboard for off-campus students
- 🚨 Emergency alert system
- 📈 Platform analytics and stats
- ⚖️ Dispute resolution

### 🤖 AI Features
- 🛡️ **Safety Score** - AI analyzes location safety
- 🗺️ **Route Finder** - Shows route from SGGS with distance/time
- 📊 **Review Summarizer** - AI summarizes reviews
- 💰 **Price Predictor** - Predicts fair rent prices
- 👥 **Roommate Matcher** - Match students with compatible roommates

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** (Cloud Database)
- **JWT** Authentication
- **Nodemailer** (Email OTP)
- **Multer** (File Uploads)
- **Razorpay** (Payment Integration - Coming Soon)

### Frontend
- **React.js** + **Vite**
- **Tailwind CSS** (Styling)
- **React Router** (Navigation)
- **Axios** (API Calls)
- **Heroicons** (Icons)
- **Google Maps API** (Maps & Routes)

### AI & APIs
- **Google Maps JavaScript API**
- **Directions API**
- **Places API**
- **Geocoding API**

---

## 📁 Project Structure
staynest/
├── backend/
│ ├── config/
│ │ ├── db.js # MongoDB Connection
│ │ └── razorpay.js # Razorpay Config
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── propertyController.js
│ │ ├── bookingController.js
│ │ ├── reviewController.js
│ │ └── adminController.js
│ ├── middleware/
│ │ ├── auth.js # JWT Verification
│ │ └── upload.js # File Upload
│ ├── models/
│ │ ├── User.js
│ │ ├── Property.js
│ │ ├── Booking.js
│ │ ├── Review.js
│ │ └── Payment.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── properties.js
│ │ ├── bookings.js
│ │ ├── reviews.js
│ │ └── admin.js
│ ├── utils/
│ │ ├── sendEmail.js
│ │ ├── generateOTP.js
│ │ └── apiResponse.js
│ ├── uploads/ # Property Images
│ ├── .env
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── common/
│ │ │ ├── student/
│ │ │ ├── landlord/
│ │ │ └── admin/
│ │ ├── context/
│ │ │ └── AuthContext.jsx
│ │ ├── pages/
│ │ │ ├── Home.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── Properties.jsx
│ │ │ ├── PropertyDetail.jsx
│ │ │ └── Dashboard.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── .env
│ ├── package.json
│ └── vite.config.js
│
├── .gitignore
├── .gitattributes
└── README.md

text

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Maps API Key

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/staynest.git
cd staynest