<div align="center">

<img src="vyntra-logo.jpg" alt="Vyntra Logo" width="120" height="120" style="border-radius: 28px;" />

# ⚡ Vyntra

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

- [About Vyntra](#-about-vyntra)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Third-Party Integrations](#-third-party-integrations--api-credentials-needed)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Admin Panel Setup](#2-admin-panel-setup)
  - [Mobile App Setup](#3-mobile-app-setup)
  - [Docker Setup](#4-docker-compose-full-local-environment)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Mobile App Screens](#-mobile-app-screens)
- [Admin Panel Pages](#-admin-panel-pages)
- [Database Schema](#-database-schema)
- [BBPS & Recharge Integration](#-bbps--recharge-integration)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 About Vyntra

**Vyntra** is a production-grade, full-stack **BBPS (Bharat Bill Payment System) Mobile Recharge & Bill Payment Platform** designed for the Indian market. It enables users to recharge mobile phones (prepaid/postpaid), pay DTH bills, and settle utility bills (electricity, water, gas, insurance, and 100+ more BBPS billers) — all through a single, beautiful app.

Built from the ground up with a **premium iOS 27 Liquid Glass design language**, Vyntra delivers an experience that feels native, fast, and delightful. Every interaction is animated with spring physics, every surface is frosted glass, and every transition feels alive.

### Why Vyntra?

| Traditional Apps | Vyntra |
|-----------------|--------|
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
│                         VYNTRA PLATFORM                              │
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

To make Vyntra fully live and working, you need accounts and API keys from these providers:

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
> - Get: Entity ID, Sender ID (e.g., VYNTRA), Template ID per message type

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
│   │   │   └── modals/           # RechargeConfirmModal, FilterModal
│   │   ├── screens/
│   │   │   ├── auth/             # Splash, Onboarding, PhoneLogin, OTPVerify, EmailLogin
│   │   │   ├── main/             # Home, Recharge, Wallet, History, Profile
│   │   │   ├── recharge/         # MobilePrepaid, MobilePostpaid, DTH, BBPS, Plans, Confirm, Status
│   │   │   ├── wallet/           # AddMoney, FundRequest, WalletHistory
│   │   │   ├── offers/           # Offers, Referral
│   │   │   └── profile/          # EditProfile, Notifications, Security, Support, TxnDetail
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
│   │   ├── styles/               # global.css, glass.css, animations.css, components.css
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Header, Layout, ProtectedRoute
│   │   │   ├── ui/               # Button, Table, Modal, Badge, Pagination, StatCard, etc.
│   │   │   └── charts/           # RevenueChart, TransactionChart, StatusPieChart, OperatorChart
│   │   ├── pages/
│   │   │   ├── auth/             # LoginPage
│   │   │   ├── dashboard/        # DashboardPage
│   │   │   ├── users/            # UsersList, UserDetail, FundRequests
│   │   │   ├── reports/          # RechargeReport, FundOrderReport, ApiLogs
│   │   │   ├── api-management/   # ApiConfigs, ApiSwitching, CircleSwitch
│   │   │   ├── operators/        # Operators, Plans
│   │   │   ├── commission/       # CommissionConfig
│   │   │   ├── communication/    # SMS, WhatsApp, Email, PaymentGateway
│   │   │   ├── rbac/             # Roles, AdminUsers
│   │   │   └── content/          # Banners, Offers, Coupons
│   │   ├── store/                # auth.store, ui.store
│   │   ├── services/             # All API service files
│   │   ├── hooks/                # useAuth, usePagination, useExport
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
├── 🖼️ vyntra-logo.jpg            # App logo
└── 📖 README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** 20.x or higher — [nodejs.org](https://nodejs.org)
- **npm** 10.x or higher
- **PostgreSQL** 16 — [postgresql.org](https://www.postgresql.org) (or use Docker)
- **Redis** 7 — [redis.io](https://redis.io) (or use Docker)
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
nano .env  # or open in your editor

# Create PostgreSQL database
createdb vyntra_db
# OR: psql -U postgres -c "CREATE DATABASE vyntra_db;"

# Sync database models (auto-creates all tables)
npm run dev
# Tables are auto-synced on first run (Sequelize sync)

# Seed default data (roles, super admin, operators)
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

**Default Super Admin Credentials:**
```
Email: admin@vyntra.in
Password: Admin@123
```

> ⚠️ **Change these immediately** in production!

---

### 2. Admin Panel Setup

```bash
cd ../admin

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:3000

# Start development server
npm run dev
# Admin panel runs on http://localhost:5174
```

---

### 3. Mobile App Setup

```bash
cd ../mobile

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
EXPO_PUBLIC_API_URL=http://localhost:3000        # Your backend URL
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx  # Your Razorpay test key

# Start Expo development server
npx expo start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator
# Scan QR code with Expo Go app for physical device
```

**For physical device testing:**  
Replace `localhost` in `.env` with your machine's local IP (e.g., `http://192.168.1.100:3000`)

---

### 4. Docker Compose (Full Local Environment)

Start PostgreSQL + Redis + Backend with one command:

```bash
# In the root directory
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Run seeds inside container
docker-compose exec backend npm run seed

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# ─── App ────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
ENCRYPTION_KEY=32-character-aes-encryption-key!!
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# ─── Database ────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vyntra_db
DB_USER=postgres
DB_PASSWORD=your-database-password

# ─── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Firebase (Auth + FCM) ───────────────────────────────
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
# Get from: Firebase Console → Project Settings → Service Accounts

# ─── Razorpay ────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
# Get from: razorpay.com/dashboard → Settings → API Keys

# ─── MSG91 (SMS OTP) ─────────────────────────────────────
MSG91_API_KEY=your-msg91-api-key
MSG91_SENDER_ID=VYNTRA
MSG91_TEMPLATE_ID=your-dlt-approved-template-id
# Get from: msg91.com → Dashboard → API

# ─── SendGrid (Email) ────────────────────────────────────
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Vyntra
# Get from: sendgrid.com → Settings → API Keys

# ─── BBPS / Recharge Aggregator ──────────────────────────
BBPS_PROVIDER=recharge1           # Options: recharge1 | pay2all | billbox
RECHARGE1_MEMBER_ID=your-member-id
RECHARGE1_API_PASSWORD=your-api-password
RECHARGE1_BASE_URL=https://www.recharge1.com/API2
PAY2ALL_API_KEY=your-pay2all-api-key
PAY2ALL_BASE_URL=https://api.pay2all.in/v1
BILLBOX_API_KEY=your-billbox-key
BILLBOX_BASE_URL=https://api.billbox.in/v1

# ─── Cloudinary (Image Uploads) ──────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
# Get from: cloudinary.com → Dashboard

# ─── Admin ───────────────────────────────────────────────
ADMIN_JWT_SECRET=admin-specific-jwt-secret-different-from-user
ADMIN_JWT_EXPIRES_IN=8h
```

### Mobile App (`mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Admin Panel (`admin/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Paginated responses:
```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/auth/send-otp` | Send OTP to phone | Public |
| POST | `/auth/verify-otp` | Verify OTP + login | Public |
| POST | `/auth/login` | Email/password login | Public |
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/admin/login` | Admin login | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| POST | `/auth/logout` | Invalidate tokens | Auth |
| POST | `/auth/forgot-password` | Send reset email | Public |
| POST | `/auth/reset-password` | Reset password | Public |

### Recharge Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/recharge/operators` | List operators by type | Auth |
| GET | `/recharge/operators/:id/plans` | Browse plans for operator+circle | Auth |
| GET | `/recharge/circles` | List telecom circles | Auth |
| POST | `/recharge/detect-operator` | Auto-detect operator from number | Auth |
| POST | `/recharge/initiate` | Start recharge transaction | Auth |
| GET | `/recharge/status/:txnId` | Check transaction status | Auth |
| POST | `/recharge/dispute/:txnId` | Raise dispute | Auth |

### BBPS Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/bbps/categories` | List BBPS categories | Auth |
| GET | `/bbps/billers` | Billers by category | Auth |
| POST | `/bbps/fetch-bill` | Fetch bill from biller | Auth |
| POST | `/bbps/pay` | Pay a bill | Auth |

### Wallet Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/wallet` | Balance + recent transactions | Auth |
| GET | `/wallet/history` | Full wallet history (paginated) | Auth |
| POST | `/wallet/add-money/create-order` | Create Razorpay order | Auth |
| POST | `/wallet/add-money/verify` | Verify payment + credit wallet | Auth |
| POST | `/wallet/fund-request` | Submit fund request | Auth |
| GET | `/wallet/fund-requests` | User's fund requests | Auth |

> See full API docs in `/backend/docs/` directory.

---

## 📱 Mobile App Screens

### Auth Flow
| Screen | Description |
|--------|-------------|
| `SplashScreen` | Animated Vyntra logo reveal with spring animation |
| `OnboardingScreen` | 3-slide intro with swipeable glass cards |
| `PhoneLoginScreen` | Phone number entry with +91 prefix |
| `OTPVerifyScreen` | 6-box OTP input with countdown timer and auto-verify |
| `EmailLoginScreen` | Email + password with Google OAuth |
| `RegisterScreen` | Full registration form |

### Main App
| Screen | Description |
|--------|-------------|
| `HomeScreen` | Balance card, quick actions grid, banners, offers, recent transactions |
| `RechargeScreen` | Tab menu: Prepaid, Postpaid, DTH, Bills |
| `WalletScreen` | Balance, add money, fund requests, history |
| `HistoryScreen` | All transactions with filters (status, date, operator) |
| `ProfileScreen` | User info, settings, referral, logout |

### Recharge Screens
| Screen | Description |
|--------|-------------|
| `MobilePrepaidScreen` | Number entry, operator auto-detect, amount, plans |
| `MobilePostpaidScreen` | Postpaid bill fetch and payment |
| `DTHRechargeScreen` | DTH operator + subscriber ID + plans |
| `BBPSCategoriesScreen` | 12 BBPS category grid |
| `BillersListScreen` | Billers for selected category |
| `BillPaymentScreen` | Account number + bill fetch + pay |
| `PlansScreen` | Browse plans: Popular, Unlimited, Data, Talktime |
| `RechargeConfirmScreen` | Summary with slide-to-pay button |
| `RechargeStatusScreen` | Success/Pending/Failed with animations |

---

## 🖥️ Admin Panel Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Admin authentication |
| Dashboard | `/dashboard` | Live stats, charts, latest transactions |
| Users List | `/users` | Search, filter, block, wallet adjust |
| User Detail | `/users/:id` | Full user info, wallet, transaction history |
| Fund Requests | `/fund-requests` | Approve/reject wallet top-up requests |
| Recharge Report | `/reports/recharge` | 20+ column report with Excel export |
| Fund Order Report | `/reports/fund-orders` | All fund transfer requests |
| API Logs | `/reports/api-logs` | Full request/response viewer |
| API Configs | `/api-configs` | Add/edit/delete recharge APIs |
| API Switching | `/api-switching` | Operator → API routing matrix |
| Operators | `/operators` | CRUD telecom operators |
| Plans | `/plans` | Recharge plans with bulk CSV upload |
| Commission | `/commission` | Flat/%, circle slab, special, range rules |
| SMS Config | `/sms-config` | MSG91 sender config |
| WhatsApp Config | `/whatsapp-config` | Interakt/Wati config |
| Email Config | `/email-config` | SendGrid/SMTP config |
| Payment Gateway | `/payment-gateway` | Razorpay config + transaction logs |
| Roles | `/roles` | RBAC role management with permissions |
| Admin Users | `/admin-users` | Admin team management |
| Banners | `/banners` | Home screen banner management |
| Offers | `/offers` | Cashback offers management |
| Coupons | `/coupons` | Coupon code management |

---

## 🗄️ Database Schema

The platform uses **18 PostgreSQL tables** with Sequelize ORM:

| Table | Description |
|-------|-------------|
| `users` | App users with wallet balance, KYC, referral |
| `transactions` | All recharge & bill payment transactions |
| `wallet_transactions` | Wallet credits/debits (fund top-up, recharge debit, refund) |
| `fund_requests` | Manual wallet top-up requests |
| `operators` | Telecom & BBPS operators |
| `plans` | Recharge plans per operator and circle |
| `api_configs` | Recharge API configurations (encrypted credentials) |
| `api_logs` | Full request/response logs per API call |
| `circle_switches` | Operator+Circle → API routing table |
| `commissions` | Commission rules (flat/%, slab, special, range) |
| `offers` | Cashback and discount offers |
| `coupons` | Coupon codes |
| `coupon_usages` | Coupon usage tracking per user |
| `admin_users` | Admin panel users |
| `roles` | Admin roles with JSONB permissions array |
| `banners` | Home screen promotional banners |
| `notifications` | User push notification history |
| `otp_records` | OTP attempts with expiry tracking |

---

## ⚡ BBPS & Recharge Integration

Vyntra supports **3 major BBPS/Recharge API providers**, switchable via environment variable:

### Recharge1 (Default)
```env
BBPS_PROVIDER=recharge1
RECHARGE1_MEMBER_ID=xxx
RECHARGE1_API_PASSWORD=xxx
RECHARGE1_BASE_URL=https://www.recharge1.com/API2
```

### Pay2All
```env
BBPS_PROVIDER=pay2all
PAY2ALL_API_KEY=xxx
PAY2ALL_BASE_URL=https://api.pay2all.in/v1
```

### BillBox
```env
BBPS_PROVIDER=billbox
BILLBOX_API_KEY=xxx
BILLBOX_BASE_URL=https://api.billbox.in/v1
```

The API switching system also supports **multiple APIs simultaneously** — different operators or circles can route to different API providers, configured from the Admin Panel.

---

## 🚢 Deployment

### Backend (Railway / Render)
```bash
# railway.toml already configured
railway login
railway init
railway up
```

### Admin Panel (Vercel)
```bash
cd admin
vercel --prod
# Set VITE_API_URL environment variable in Vercel dashboard
```

### Mobile App (Expo EAS Build)
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure

# Android (APK/AAB)
eas build --platform android

# iOS (IPA)
eas build --platform ios
```

> **Google Play Store** requires AAB format. **App Store** requires IPA + Apple Developer Program.

---

## 📋 TRAI DLT Compliance

For SMS OTP to work in India, you **must** complete DLT registration:

1. Register your entity on a DLT portal (Vodafone, Airtel, or BSNL)
2. Get **Entity ID** and **Sender ID** (e.g., VYNTRA)
3. Create and get approved **message templates** for:
   - OTP delivery
   - Recharge success/failure
   - Wallet credit notification
4. Configure in `backend/.env`: `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID`
5. Configure in MSG91 dashboard

---

## 🔐 Security

- JWT with short expiry (15min) + refresh token rotation
- Redis-backed token blacklist for immediate revocation
- API credentials AES-encrypted in database
- Rate limiting: OTP (5/hr/phone), API (100/min/IP)
- Helmet.js security headers
- CORS restricted to configured origins
- Bcrypt password hashing (cost factor: 12)
- SQL injection prevention via Sequelize parameterized queries
- Input validation via Joi on all endpoints

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

## 👨‍💻 Built By

**Raunit Raj**  
📧 [raunitx.online](https://raunitx.online)  
📱 +91-72928-58748  
🌐 [raunitx-02](https://github.com/raunitx-02)

---

<div align="center">

**⚡ Vyntra** — *Recharge your world, instantly.*

Made with ❤️ for the Indian fintech ecosystem

[![Star this repo](https://img.shields.io/github/stars/raunitx-02/mobile-recharge-application?style=social)](https://github.com/raunitx-02/mobile-recharge-application)
[![Follow](https://img.shields.io/github/followers/raunitx-02?style=social)](https://github.com/raunitx-02)

</div>
