# LifeVault BBMS — Team Development Architecture & Directory Structure

Welcome to the **LifeVault Blood Bank Management System (BBMS)** codebase architecture guide. This document outlines the modular directory layout designed for seamless parallel frontend and backend team development.

---

## 📁 Repository Overview

```
bbms/
├── frontend / src/              # Frontend Application Architecture (React + Vite + Tailwind)
│   ├── components/              # Shared Reusable UI, Layouts & Modals
│   │   ├── ui/                  # Atomic & Design System UI Elements (Buttons, Cards, Canvas)
│   │   ├── layout/              # App Navigation & Footers (Navbar, Footer)
│   │   └── modals/              # Interactive Overlay Modals (Donor, Hospital, Search)
│   ├── pages/                   # Sorted Feature Pages & Views
│   │   ├── home/                # Landing, Overview & Hero sections
│   │   ├── donor/               # Donor onboarding, scheduling & compatibility
│   │   ├── hospital/            # Hospital network portal & dispatch
│   │   └── dashboard/           # Real-time blood stock telemetry & cold-chain
│   ├── services/                # API Services & HTTP Clients (donor, hospital, inventory)
│   ├── types/                   # Shared TypeScript Data Interfaces
│   ├── hooks/                   # Custom React Hooks
│   └── utils/                   # Helper Utilities & Compatibility Calculators
│
├── backend/                     # Backend API Microservice (Node.js / Express Architecture)
│   ├── config/                  # DB connection & Environment configuration
│   ├── controllers/             # Endpoint Logic Handlers (Auth, Donor, Hospital, Inventory)
│   ├── models/                  # Data Models & Schemas (User, Donor, Hospital, InventoryItem)
│   ├── routes/                  # Express Route Definitions
│   ├── services/                # Core Business Logic Engines (ABO/Rh Matrix, FEFO Queue)
│   ├── middleware/              # Authentication & Error Handling Middlewares
│   └── server.ts                # Backend Server Initialization Entrypoint
│
└── docs/                        # Architecture & Developer Documentation
    └── ARCHITECTURE.md          # This Guide
```

---

## 🛠️ Path Aliases for Easy Imports

The project is configured with TypeScript and Vite path aliases to make imports clean and maintainable for team members:

| Alias | Path | Example Usage |
|---|---|---|
| `@ui` | `src/components/ui` | `import { AnimatedButton, SpotlightCard } from '@ui/index';` |
| `@layout` | `src/components/layout` | `import { Navbar, Footer } from '@layout/index';` |
| `@modals` | `src/components/modals` | `import { DonorModal, HospitalPortalModal } from '@modals/index';` |
| `@pages` | `src/pages` | `import { HeroSection, AboutSection } from '@pages/home';` |
| `@services`| `src/services` | `import { inventoryService } from '@services/inventoryService';` |
| `@types` | `src/types` | `import { BloodGroup, IDonor } from '@types/index';` |
| `@hooks` | `src/hooks` | `import { useModalState } from '@hooks/useModalState';` |
| `@utils` | `src/utils` | `import { canDonateTo } from '@utils/compatibilityMatrix';` |
| `@backend` | `backend` | `import { CompatibilityEngine } from '@backend/services/compatibilityEngine';` |

---

## 👥 Team Responsibilities & Workflow

### 🎨 Frontend Team Focus Areas
- **UI Components (`src/components/ui/`)**: Reusable atomic visual components.
- **Pages (`src/pages/`)**: Domain pages categorized into `home`, `donor`, `hospital`, and `dashboard`.
- **API Services (`src/services/`)**: Integration layer interfacing with backend endpoints.

### ⚙️ Backend Team Focus Areas
- **Controllers & Routes (`backend/controllers/`, `backend/routes/`)**: API endpoints for authentication, donor scheduling, hospital orders, and live inventory.
- **Domain Services (`backend/services/`)**: ABO/Rh compatibility engine and FEFO (First-Expired-First-Out) queue allocation.
- **Models & Middlewares (`backend/models/`, `backend/middleware/`)**: Data contracts and security.

---

## 🚀 Running the Project

```bash
# Frontend Development Server
npm run dev

# Production Build Verification
npm run build
```
