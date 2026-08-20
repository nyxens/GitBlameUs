# 🩸 LifeVault — Online Blood Bank Management System (BBMS)

> **Smart Blood Banking. Zero Waste.**  
> An enterprise-grade Blood Bank Management & Allocation System built with native JavaScript (React + Express.js API + MongoDB ODM). Designed around a 10-collection ER architecture for blood collection, cold storage tracking, FEFO expiration queueing, and emergency request fulfillment.

---

## 📌 Executive Summary

LifeVault bridges hospital healthcare facilities, regional blood banks, medical staff, and voluntary donors in real time. It eliminates blood waste and fulfillment delays through:
1. **10-Collection ER Data Model**: High-integrity database schema supporting `Admin`, `Hospital`, `BloodBank`, `Staff`, `User`, `Donor`, `Inventory`, `BloodBag`, `Request`, and `Allotment`.
2. **FEFO (First-Expired-First-Out) Queue Engine**: Automated sorting ensuring blood bags nearing expiration are allocated first.
3. **Cold Storage Shelf & Cell Tracking**: Pinpoint physical tracking down to cell number (`cellno`) and shelf number (`shelfno`) across hospital and blood bank lockers.
4. **Audited Allotment & Staff Approval**: Safe, atomic blood bag dispatch linking patient requests to physical units authorized by licensed medical staff.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite 5 | Fast HMR, ESM bundling |
| **Styling & Design System** | TailwindCSS 3 + Vanilla CSS | Pitch-black dark mode, custom glassmorphism, Framer Motion 11 |
| **Icons & Typography** | Lucide React + Fontsource | Inter font, Instrument Serif font |
| **Backend Server** | Node.js (ESM) + Express.js 4 | Modular REST API (`/api/v1`), CORS, error handling middleware |
| **Database & ODM** | MongoDB 6.0+ with Mongoose | 10 ER-aligned schemas with compound FEFO indexes and ACID transactions |

---

## 🗄️ Database Architecture (10 ER Collections)

| Entity | Collection | Key Fields | Description |
|---|---|---|---|
| **ADMIN** | `admins` | `admin_id`, `username`, `email`, `password` | Root system administrators managing facilities and staff. |
| **HOSPITAL** | `hospitals` | `hos_id`, `hos_name`, `pincode`, `I_Id` | Healthcare facilities with inventory storage links. |
| **BLOODBANK** | `bloodbanks` | `bank_id`, `bank_name`, `pincode`, `I_Id` | Regional processing centers & blood banks. |
| **STAFF** | `staff` | `S_Id`, `role`, `department`, `licence_id`, `hos_or_bank_id`, `u_id` | Clinical staff who collect blood and approve allotments. |
| **USER** | `users` | `u_Id`, `username`, `DOB`, `pincode`, `email`, `bloodgroup`, `gender`, `status` | Base user profiles for donors, patients, and staff. |
| **DONOR** | `donors` | `D_Id`, `u_id`, `date_of_donation`, `weight_donated`, `bag_id`, `S_Id`, `pincode` | Blood donation events producing blood bag units. |
| **INVENTORY** | `inventories` | `I_ID`, `cellno`, `shelfno`, `pincode`, `hos_or_bank_id`, `isfull` | Cold storage compartments and shelves. |
| **BLOODBAG** | `bloodbags` | `bag_id`, `bloodgroup`, `haemoglobin`, `pressure`, `date_of_donation`, `isdiscresed`, `expired_date`, `S_Id`, `I_ID`, `status`, `weight` | Individual blood units with physiological vitals and expiry. |
| **REQUEST** | `requests` | `req_id`, `u_id`, `bloodgroup`, `weight`, `pincode`, `date_of_request`, `date_of_requirement`, `A_id` | Blood requirements placed by users/recipients. |
| **ALLOTMENT** | `allotments` | `a_id`, `req_id`, `bag_id`, `s_id`, `date_of_allocation` | Legally auditable allotment linking a request to a blood bag with staff authorization. |

---

## 📂 Project Directory Architecture

```
bbms/
├── backend/                  # Express.js REST API Server
│   ├── config/               # Environment & Database Configuration
│   ├── controllers/          # Business Logic Controllers (Auth, Donor, Hospital, Inventory, Requisition)
│   ├── middleware/           # Express Middleware (Error Handling, Auth Validation)
│   ├── models/               # 10 Core ER Models (Admin, Hospital, BloodBank, Staff, User,
│   │                         #                     Donor, Inventory, BloodBag, Request, Allotment)
│   ├── routes/               # API Route Definitions (/api/v1/*)
│   ├── services/             # Compatibility & FEFO Queue Engines
│   └── server.js             # Express Server Entry Point
├── documents/                # System Specifications & Schemas
│   ├── ARCHITECTURE.md       # Directory layout & code conventions
│   ├── DBSCHEMA.md           # Master Database Schema & Data Dictionary (10 Collections)
│   ├── DESIGN.md             # Liquid Glass Design System Guidelines
│   ├── PRODUCT.md            # Product Positioning, Scope & Features
│   ├── PRODUCT_README.md     # This Product Guide & API Reference
│   ├── SRS.md                # Software Requirements Specification (v2.1)
│   └── er_diagram.png        # System Entity Relationship Diagram
├── src/                      # Frontend React Source Code
│   ├── components/           # UI Components & Layout
│   │   ├── layout/           # Navbar, Footer, App Shell
│   │   ├── modals/           # Auth Modal, Donor Schedule Modal, Hospital Requisition Modal
│   │   └── ui/               # Design System Primitives (InteractiveHoverButton, SpotlightCard, etc.)
│   ├── lib/                  # Utility Helpers (cn class merger)
│   ├── pages/                # Landing Page & Application Portals
│   │   ├── citizen/          # Citizen Donor Workspace Portal
│   │   ├── dashboard/        # Interactive Dashboard Control Panel (Blood Reserve, Requests, Supply)
│   │   ├── donor/            # Donor Section & Compatibility Guide
│   │   ├── home/             # Hero, Pricing, Reviews, About Sections
│   │   └── hospital/         # Hospital Emergency Portal Section
│   ├── App.jsx               # Application Root State & Navigation Handler
│   ├── index.css             # Design Tokens & Custom CSS Rules
│   └── main.jsx              # Vite React Mounting Point
├── package.json              # Project Dependencies & NPM Scripts
├── tailwind.config.js        # Tailwind Utility Customization
└── vite.config.js            # Vite Bundler & Path Alias Resolver
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0+ (or MongoDB Atlas connection URI)

### 2. Installation
```bash
git clone https://github.com/nyxens/GitBlameUs.git
cd bbms
npm install
```

### 3. Running the Development Servers

#### **Start Frontend Dev Server (Vite)**:
```bash
npm run dev
```
*App will run locally at [http://localhost:5173](http://localhost:5173)*

#### **Start Express API Backend Server**:
```bash
npm run server
```
*API Server will listen at [http://localhost:5000](http://localhost:5000)*

---

## 🛠️ Production Build

```bash
npm run build
```
Outputs optimized static assets into the `dist/` directory.

---

## 🔌 Express API Endpoint Reference (`/api/v1`)

| Method | Endpoint | Description | Key Models |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server health check endpoint | — |
| `POST` | `/api/v1/auth/login` | User/Staff authentication | `User`, `Admin`, `Staff` |
| `POST` | `/api/v1/auth/register` | Account registration for donors and healthcare personnel | `User`, `Staff` |
| `POST` | `/api/v1/donors/schedule` | Record blood donation session | `Donor`, `BloodBag`, `Staff` |
| `POST` | `/api/v1/hospital/requisition` | Create blood request | `Request`, `User` |
| `GET` | `/api/v1/inventory` | Fetch live blood bank stock levels | `BloodBag`, `Inventory` |
| `GET` | `/api/v1/requisitions` | Fetch active emergency requests and allocations | `Request`, `Allotment` |

---

## 📄 License & Compliance

LifeVault is designed to comply with **HIPAA** and **AABB (American Association of Blood Banks)** accreditation standards for cold-chain audit logging and donor record encryption.