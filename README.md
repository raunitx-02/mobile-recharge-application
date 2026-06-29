<div align="center">

# ⚡ OptionsPay

### *Recharge your world, instantly.*

**A full-stack BBPS Mobile Recharge & Bill Payment Platform**  
built with React Native · Node.js · PostgreSQL · Razorpay · iOS 27 Liquid Glass Design

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React Native](https://img.shields.io/badge/React_Native-Expo_50-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://expo.dev)
[![React](https://img.shields.io/badge/Admin-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-072654?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Firebase](https://img.shields.io/badge/Auth_%26_Push-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![MSG91](https://img.shields.io/badge/SMS_OTP-MSG91-0072FF?style=for-the-badge)](https://msg91.com)
[![SendGrid](https://img.shields.io/badge/Email-SendGrid-1A82E2?style=for-the-badge&logo=twilio&logoColor=white)](https://sendgrid.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## 📖 Table of Contents

- [About OptionsPay](#-about-optionspay)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Third-Party Integrations](#-third-party-integrations--api-credentials-needed)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Mobile App Screens](#-mobile-app-screens)
- [Admin Panel Pages](#-admin-panel-pages)
- [Database Schema](#-database-schema)
- [BBPS & Recharge Integration](#-bbps--recharge-integration)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 About OptionsPay

**OptionsPay** is a production-grade, full-stack **BBPS (Bharat Bill Payment System) Mobile Recharge & Bill Payment Platform** designed for the Indian market. It enables users to recharge mobile phones (prepaid/postpaid), pay DTH bills, and settle utility bills (electricity, water, gas, insurance, and 100+ more BBPS billers) — all through a single, beautiful app.

Built from the ground up with a **premium iOS 27 Liquid Glass design language**, OptionsPay delivers an experience that feels native, fast, and delightful. Every interaction is animated with spring physics, every surface is frosted glass, and every transition feels alive.

### Why OptionsPay?

| Traditional Apps | OptionsPay |
|-----------------|-----------|
| Generic, dated UI | iOS 27 Liquid Glass, premium light mode |
| Basic features | Complete BBPS integration + smart wallet |
| No API flexibility | Multi-API switching per operator/circle |
| Limited admin control | Full-featured admin panel with RBAC |
| Basic reports | 20+ column recharge report, fund orders, API logs |
| Single payment method | Razorpay: UPI, Cards, NetBanking, Wallets |

---

## ✨ Key Features

### 📱 Mobile App (iOS & Android)
- **🔐 Authentication** — Phone OTP (MSG91, DLT-compliant), Email/Password, Google OAuth (Firebase)
- **⚡ Instant Recharge** — Mobile Prepaid/Postpaid, DTH with operator auto-detection
- **🏦 BBPS Bill Payments** — Electricity, Water, Gas, Broadband, Insurance, Cable TV, FASTag, Loan EMI, LPG, Credit Card and 100+ more
- **💰 Smart Wallet** — Add money via Razorpay (UPI/Card/NetBanking), fund requests, full transaction history
- **🎁 Offers & Cashback** — Dynamic offers, coupon codes, referral rewards
- **🔔 Push Notifications** — Firebase FCM for transaction alerts, offers, and system messages
- **📊 Full History** — Filterable recharge and wallet transaction history with receipts
- **🧊 iOS 27 Liquid Glass** — Frosted glass UI, floating tab bar, spring animations throughout

### 🖥️ Admin Panel (Web)
- **📈 Live Dashboard** — Revenue, transaction, user, and API health analytics with real-time charts
- **👥 User Management** — Full user CRUD, wallet adjustments, API overrides, KYC status
- **💳 Fund Requests** — Approve/reject manual wallet top-up requests with notifications
- **⚙️ API Management** — Configure multiple recharge APIs, switch operators/circles, view API logs
- **📱 Operator & Plans** — Full CRUD for operators, plans, denominations with bulk CSV upload
- **💸 Commission Engine** — Flat/%, circle slab, special, and range-based commission rules
- **📋 Reports Engine** — Full recharge report (20+ columns), fund order report, API log detail — all exportable to Excel
- **🔒 RBAC** — Role-based access control with granular permissions per admin team member
- **📣 Communication APIs** — SMS (MSG91), WhatsApp (Interakt/Wati), Email (SendGrid) configuration
- **🎨 Content Management** — Banners, promotional offers, coupon codes

### 🔧 Backend (Node.js API)
- **RESTful API** — 60+ endpoints with consistent JSON responses
- **JWT Auth** — Access tokens (15min) + Refresh tokens (30 days) with Redis-backed revocation
- **Atomic Wallet Ops** — All wallet debit/credit wrapped in PostgreSQL transactions
- **API Switching** — Intelligent routing: user override → circle switch → operator default
- **Real-time** — Socket.io for live transaction status updates
- **Rate Limiting** — OTP: 5/hour/phone, General: 100/min/IP
- **Encryption** — AES-encrypted API credentials in database

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        OPTIONSPAY PLATFORM                            │
│                                                                      │
│  ┌─────────────────┐          ┌──────────────────────────────────┐  │
│  │   📱 Mobile App  │          │       🖥️ Admin Panel             │  │
│  │  React Native   │          │     React 18 + Vite 5           │  │
│  │    Expo SDK 50  │          │   (http://localhost:5174)        │  │
│  │  iOS + Android  │          └──────────────┬───────────────────┘  │
│  └────────┬────────┘                         │                       │
│           │                                  │                       │
│           └──────────────────┬───────────────┘                       │
│                              ▼                                        │
│                 ┌─────────────────────────┐                          │
│                 │    🔧 Backend API        │                          │
│                 │   Node.js + Express     │                          │
│                 │  (http://localhost:3000) │                          │
│                 │   + Socket.io           │                          │
│                 └────────────┬────────────┘                          │
│                              │                                        │
│          ┌───────────────────┼──────────────────────┐               │
│          ▼                   ▼                       ▼               │
│    ┌──────────┐       ┌──────────┐          ┌──────────────┐        │
│    │PostgreSQL│       │  Redis   │          │  Cloudinary  │        │
│    │   DB     │       │ Cache +  │          │  (Images)    │        │
│    │  Port    │       │ Sessions │          └──────────────┘        │
│    │  5432    │       │  6379    │                                   │
│    └──────────┘       └──────────┘                                   │
│                                                                      │
│  External Services:                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Recharge1 │ │Razorpay  │ │  MSG91   │ │Firebase  │ │SendGrid  │ │
│  │/BillBox  │ │/Cashfree │ │ SMS OTP  │ │FCM Push  │ │  Email   │ │
│  │  (BBPS)  │ │(Payments)│ │          │ │ + Auth   │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Mobile App
| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 50 |
| Language | TypeScript |
| Navigation | React Navigation v6 (custom floating tab bar) |
| Animations | React Native Reanimated 3 (spring physics) |
| Gestures | React Native Gesture Handler |
| State | Zustand 4 |
| API Client | Axios with interceptors & token refresh |
| UI | expo-blur (liquid glass), expo-linear-gradient, expo-haptics |
| Storage | expo-secure-store (tokens), AsyncStorage |
| Push | expo-notifications + Firebase FCM |
| Forms | react-hook-form + yup |
| Lists | @shopify/flash-list |
| Dates | dayjs |

### Admin Panel
| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Language | TypeScript |
| Routing | React Router DOM v6 |
| State | Zustand 4 |
| Data Fetching | TanStack Query v5 |
| Charts | Recharts |
| Forms | react-hook-form + yup |
| Icons | Lucide React |
| Styling | Vanilla CSS (glass morphism, CSS variables) |
| Notifications | react-hot-toast |
| Exports | XLSX (Excel export) |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | JavaScript (ES6+) |
| ORM | Sequelize v6 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (ioredis) |
| Auth | JWT (access + refresh) |
| Real-time | Socket.io |
| Validation | Joi |
| Logging | Winston |
| Security | Helmet, CORS, express-rate-limit |
| Uploads | Multer + Cloudinary |

---

## 🔑 Third-Party Integrations & API Credentials Needed

To make OptionsPay fully live and working, you need accounts and API keys from these providers:

### Mandatory (Core Functionality)

| Service | Purpose | Where to Get | Cost |
|---------|---------|-------------|------|
| **Recharge1 / Pay2All / BillBox** | Live mobile recharges + BBPS bill payments | recharge1.in / pay2all.in | Per transaction |
| **Razorpay** | Wallet top-up via UPI, Cards, Net Banking | razorpay.com/dashboard | ~2% per transaction |
| **MSG91** | Phone OTP delivery (DLT-compliant) | msg91.com | ~₹0.16/SMS |
| **Firebase** | FCM push notifications + social auth | console.firebase.google.com | Free tier available |
| **SendGrid** | Transaction emails, OTP fallback | sendgrid.com | Free up to 100/day |

### DLT Registration (India-Specific, Required for SMS OTP)

> ⚠️ **TRAI DLT Registration is mandatory** for all transactional SMS (including OTP) in India.  
> Without DLT-registered Sender ID and approved templates, OTP SMS **will not be delivered**.  
> - One-time cost: **~₹5,900** for DLT registration  
> - Register at: DLT portals like Vodafone, Airtel, or BSNL  
> - Get: Entity ID, Sender ID (e.g., AETHER), Template ID per message type

### Optional (Recommended)

| Service | Purpose | Cost |
|---------|---------|------|
| **Interakt / Wati** | WhatsApp transaction alerts | ₹999–₹3,999/month |
| **Cloudinary** | Banner/profile image uploads | Free tier available |
| **AWS / Railway** | Backend hosting | ₹500–₹2,000/month |
| **Supabase** | Managed PostgreSQL (free tier) | Free up to 500MB |

### Store Accounts (For App Publishing)

| Platform | Account | Cost |
|----------|---------|------|
| Google Play | Google Play Developer Account | ~₹2,080 (one-time) |
| Apple App Store | Apple Developer Program | ~₹8,700/year |

---

## 📁 Project Structure

```
mobile-recharge-application/
│
├── 📱 mobile/                    # React Native Expo App
│   ├── src/
│   │   ├── theme/                # iOS 27 design system (colors, glass, typography)
│   │   ├── components/
│   │   │   ├── ui/               # GlassCard, FloatingTabBar, SlideButton, PinInput, etc.
│   │   │   └── modals/           # RechargeConfirmModal
│   │   ├── screens/
│   │   │   ├── auth/             # Splash, PhoneLogin, OTPVerify
│   │   │   ├── main/             # Home, Recharge, Wallet, History
│   │   │   └── profile/          # ProfileScreen
│   │   ├── navigation/           # RootNavigator, AuthNavigator, MainNavigator
│   │   ├── store/                # Zustand stores (auth, wallet, recharge)
│   │   ├── services/             # API service layer (auth, recharge, wallet, bbps, offers)
│   │   ├── hooks/                # Custom hooks (useAuth, useWallet, useDebounce)
│   │   └── utils/                # Formatters, validators, storage helpers, constants
│   ├── App.tsx                   # App root
│   ├── app.json                  # Expo config
│   └── package.json
│
├── 🖥️ admin/                     # React.js Admin Panel
│   ├── src/
│   │   ├── styles/               # global.css, glass.css, animations.css
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/             # LoginPage
│   │   │   └── DashboardPage.tsx
│   │   ├── store/                # auth.store
│   │   ├── services/             # All API service files
293: │   │   ├── hooks/                
│   │   ├── utils/                # formatters, constants
│   │   └── types/                # TypeScript type definitions
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── 🔧 backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/               # database.js, redis.js, firebase.js
│   │   ├── models/               # Sequelize models (18 tables)
│   │   ├── middleware/           # auth, adminAuth, rbac, rateLimit, validate, errorHandler
│   │   ├── routes/               # All route files (user + admin)
│   │   ├── controllers/          # Business logic controllers
│   │   ├── services/             # bbps, razorpay, msg91, fcm, sendgrid, wallet, commission, recharge
│   │   ├── validators/           # Joi validation schemas
│   │   └── utils/                # jwt, otp, encryption, pagination, response, logger
│   ├── seeders/                  # Default roles, super admin, Indian operators
│   ├── server.js                 # Express + Socket.io server
│   ├── Dockerfile
│   └── package.json
│
├── 🐳 docker-compose.yml         # PostgreSQL + Redis + Backend
├── 📄 .gitignore
└── 📖 README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** 20.x or higher — [nodejs.org](https://nodejs.org)
- **npm** 10.x or higher
- **PostgreSQL** 16 — [postgresql.org](https://www.postgresql.org) (or use SQLite in dev mode)
- **Redis** 7 — [redis.io](https://redis.io) (or fallback to Mock Client)
- **Expo CLI** — `npm install -g expo-cli`
- **Git** — [git-scm.com](https://git-scm.com)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/raunitx-02/mobile-recharge-application.git
cd mobile-recharge-application/backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# Set USE_SQLITE=true to bypass PostgreSQL local setup

# Seed default data (roles, super admin, operators)
USE_SQLITE=true NODE_ENV=development node src/seeders/run.js

# Start development server
USE_SQLITE=true NODE_ENV=development npm run dev
# Server runs on http://localhost:3000
```

**Default Super Admin Credentials:**
```
Email: admin@optionspay.in
Password: Admin@123
```

---

### 2. Admin Panel Setup

```bash
cd ../admin

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
# Admin panel runs on http://localhost:5173
```

---

### 3. Mobile App Setup

```bash
cd ../mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=3000
USE_SQLITE=true
JWT_SECRET=optionspay-super-secret-jwt-key
JWT_REFRESH_SECRET=optionspay-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
ENCRYPTION_KEY=32-char-encryption-key-here-for-aether-pay
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=optionspay_db
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

MSG91_API_KEY=your-msg91-api-key
MSG91_SENDER_ID=AETHER
MSG91_TEMPLATE_ID=your-dlt-template-id

SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@optionspay.in
SENDGRID_FROM_NAME=OptionsPay
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/auth/send-otp` | Send OTP to phone | Public |
| POST | `/auth/verify-otp` | Verify OTP + login | Public |
| POST | `/auth/login` | Email/password login | Public |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| POST | `/auth/logout` | Invalidate tokens | Auth |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⚡ OptionsPay** — *Recharge your world, instantly.*

Made with ❤️ for the Indian fintech ecosystem

</div>
