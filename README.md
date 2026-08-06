# GitBlameUs — LifeVault BBMS

> **Smart Blood Banking. Zero Waste.**  
> A next-generation Blood Bank Management & Life Vault Telemetry System built with React + Express.js.

---

## Directory Organization

The repository is modularly structured into three distinct folders for independent development, testing, and deployment:

```
GitBlameUs/
├── frontend/             # React + Vite + Tailwind CSS User Interface
├── backend/              # Express.js REST API Server & FEFO Engine
└── documents/            # Architecture, Design, SRS & Product Specs
```

---

## Workspace Breakdown

### 1. Frontend (`/frontend`)
Contains the user interface, component design system, and client-side page routes.
- **Tech Stack**: React 18, Vite 8, Tailwind CSS, Framer Motion, Lucide Icons
- **Independent Setup**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Deployment**: Deployable independently to Vercel, Netlify, Cloudflare Pages, or static web host (`npm run build`).

### 2. Backend (`/backend`)
Contains the Express.js API server, models, controllers, routes, and FEFO inventory algorithm.
- **Tech Stack**: Node.js, Express, CORS, REST APIs
- **Independent Setup**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- **Deployment**: Deployable independently to Render, Railway, AWS ECS, Heroku, or Docker (`npm start`).

### 3. Documents (`/documents`)
Contains comprehensive project documentation:
- [`ARCHITECTURE.md`](file:///home/student/424144/SE/OBBMS/GitBlameUs/documents/ARCHITECTURE.md) — Architectural design & system data flow
- [`DESIGN.md`](file:///home/student/424144/SE/OBBMS/GitBlameUs/documents/DESIGN.md) — Liquid glass dark mode design system specifications
- [`PRODUCT.md`](file:///home/student/424144/SE/OBBMS/GitBlameUs/documents/PRODUCT.md) — Product vision & operational workflows
- [`SRS.md`](file:///home/student/424144/SE/OBBMS/GitBlameUs/documents/SRS.md) — Software Requirements Specification
- [`PRODUCT_README.md`](file:///home/student/424144/SE/OBBMS/GitBlameUs/documents/PRODUCT_README.md) — Original product guide & features

---

## Development Commands (Root Orchestration)

You can run individual workspaces from the root directory:

- **Start Frontend**: `npm run dev:frontend`
- **Start Backend**: `npm run dev:backend`
- **Build Frontend**: `npm run build:frontend`
- **Start Backend Server**: `npm run start:backend`