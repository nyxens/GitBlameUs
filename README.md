# 🩸 LifeVault — Online Blood Bank Management System (BBMS)

> **Smart Blood Banking. Zero Waste.**  
> A next-generation Blood Bank Management & Life Vault Telemetry System. Built with native JavaScript (ESM React + Express.js API) designed for emergency room trauma dispatches, FEFO expiration queueing, cold-chain storage telemetry, and citizen donor scheduling.

---

## 📌 Executive Summary

LifeVault bridges hospital emergency rooms, blood bank storage facilities, and voluntary donors in real time. It eliminates blood waste and shortage delays through:
1. **FEFO (First-Expired-First-Out) Queue Engine**: Automated sorting that ensures blood bags nearing expiration are allocated first.
2. **Cold-Chain Telemetry (2°C–6°C)**: Refrigerator sensor monitoring with instant anomaly alerts and automated compliance logs.
3. **Emergency Cross-Hospital Dispatch**: 15-minute courier dispatches for critical trauma cases across regional health hubs.
4. **Interactive Compatibility & Donor Scheduling**: Digital eligibility screening, blood compatibility guides, and life-impact notifications.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite 5 | Fast HMR, ESM bundling |
| **Styling & Design System** | TailwindCSS 3 + Vanilla CSS | Pitch-black dark mode, custom glassmorphism, Framer Motion 11 |
| **Icons & Typography** | Lucide React + Fontsource | Inter font, Instrument Serif font |
| **Backend Server** | Node.js (ESM) + Express.js 4 | Modular REST API (`/api/v1`), CORS, custom error handling middleware |
| **Data Engine** | Native JS Storage Models | In-memory database schemas for Donors, Hospitals, Inventory & Requisitions |

---

## 📂 Project Directory Architecture

```
bbms/
├── backend/                  # Express.js REST API Server
│   ├── config/               # Environment & Database Configuration
│   │   ├── db.js             # Mock Database Engine & Models
│   │   └── env.js            # Environment Variables (Port 5000)
│   ├── controllers/          # Business Logic Controllers (Auth, Donor, Hospital, Inventory)
│   ├── middleware/           # Express Middleware (Error Handling, Auth Validation)
│   ├── routes/               # API Route Definitions (/api/v1/*)
│   └── server.js             # Express Server Entry Point
├── docs/                     # SRS & Architecture Specifications
│   ├── ARCHITECTURE.md       # Directory layout & code conventions
│   └── SRS.md                # Software Requirements Specification (v2.0)
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
├── jsconfig.json             # JS Alias Configuration (@ui, @pages, @layout, @backend)
├── package.json              # Project Dependencies & NPM Scripts
├── tailwind.config.js        # Tailwind Utility Customization
└── vite.config.js            # Vite Bundler & Path Alias Resolver
```

---

## ⚡ Module & Path Aliases

To maintain clean imports without deep relative paths (`../../`), use configured path aliases in frontend files:

| Alias | Resolves To | Description |
| :--- | :--- | :--- |
| `@ui` | `src/components/ui` | Design primitives (`InteractiveHoverButton`, `SpotlightCard`) |
| `@layout` | `src/components/layout` | Shell layout components (`Navbar`, `Footer`) |
| `@modals` | `src/components/modals` | Interactive modal overlays |
| `@pages` | `src/pages` | Landing page sections & workspace portals |
| `@services` | `src/services` | API client services |
| `@backend` | `backend/` | Express server modules |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install all dependencies:
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
In a separate terminal tab:
```bash
npm run server
```
*API Server will listen at [http://localhost:5000](http://localhost:5000)*

---

## 🛠️ Production Build

To compile the application bundle for production:
```bash
npm run build
```
Outputs static assets into the `dist/` directory. Verified clean build with 0 compilation errors.

To preview the built production bundle:
```bash
npm run preview
```

---

## 🔌 Express API Endpoint Reference (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check endpoint |
| `POST` | `/api/v1/auth/login` | User authentication (Citizen Donor / Hospital Staff) |
| `POST` | `/api/v1/auth/register` | Account registration for donors and healthcare personnel |
| `POST` | `/api/v1/donors/schedule` | Book a blood donation slot |
| `POST` | `/api/v1/hospital/requisition` | Create an emergency blood unit requisition |
| `GET` | `/api/v1/inventory` | Fetch live blood bank stock levels |
| `GET` | `/api/v1/requisitions` | Fetch active emergency hospital requisitions |

---

## 🎨 UI/UX Design System Guidelines

- **Theme Baseline**: Pitch-black (`#000000`), deep dark cards (`bg-neutral-950/80`), subtle glowing borders (`border-purple-500/30`, `border-red-500/30`).
- **Typography**: Inter for crisp UI text; Instrument Serif for elegant italicized emphasis.
- **Micro-Interactions**:
  - `SpotlightCard`: Mouse radial light spotlight tracking cursor.
  - `InteractiveHoverButton`: Fixed stationary icon pod on rest; smooth expanding background color fill on hover.
  - **Framer Motion**: Smooth scroll entrance animations (`whileInView`) for all cards and section headers.

---

## 📄 License & Compliance

LifeVault is designed to comply with **HIPAA** and **AABB (American Association of Blood Banks)** accreditation standards for cold-chain audit logging and donor record encryption.