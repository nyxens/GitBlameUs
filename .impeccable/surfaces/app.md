# Surface Brief: LifeVault Application (`app`)

<!-- impeccable:surface-brief 1 -->

## 1. Job and Audience
- **Target Audience**: Blood bank managers, lab technicians, hospital doctors, emergency coordinators, and citizen donors.
- **Visitor Mode**: **Operate** & **Persuade** (Integrated landing page + dual-role Citizen & Hospital WebApp portals).
- **Operating Context**: Hospital emergency rooms, blood bank vaults, mobile donor devices, regional health centers.

## 2. Outcome and Proof
- **Primary Task**:
  1. Explore public LifeVault portal (hero with interactive telemetry preview, donor eligibility guide, testimonials).
  2. Manage live FEFO blood inventory across 8 blood groups and components with zero waste protocols.
  3. Execute automated ABO/Rh blood compatibility validation and emergency transfusion dispatches.
  4. Schedule donor appointments, generate digital donor cards, and track emergency courier dispatches.
- **Proof & Truth**: Real-time compatibility verification matrix, FEFO expiry queue, live cold-chain telemetry, digital donor cards, Express API endpoints.

## 3. Selected Direction & Visual Identity
- **Visual Identity**: The Crimson Vault — Pitch-black canvas (`#000000`/`#0d0d0d`) paired with high-luminance royal purple (`#a855f7`) and emergency rose/crimson (`#f43f5e`) glassmorphic accents and vector dot-matrix canvas backdrop.
- **Typography**: `Inter` (sans-serif structural body & display) with `Instrument Serif` (italic emphasis).
- **Topology**: Persistent header with role-based view switcher (Landing View vs Citizen/Hospital Workspaces), instant auth modal, live telemetry widgets, and modal workflows.

## 4. Scope & Boundaries
- **Fidelity**: Complete, fully functional single-page web application (SPA) powered by React + Vite JavaScript on the frontend and Node + Express API on the backend.
- **Files**: `src/App.jsx`, `src/main.jsx`, `src/components/**/*`, `src/pages/**/*`, `backend/server.js`.

## 5. Key Modules
- **Landing Page Flow**: Interactive dot-matrix hero canvas, parallax scroll effects, 3-step donor impact timeline, blood compatibility matrix tool, hospital portal showcase.
- **Citizen Workspace**: Digital donor card with QR scan tag, 90-day eligibility indicator, appointment slot booking, patient blood request creation, and active courier request tracker.
- **Hospital Management WebApp**: FEFO inventory queue with critical stock highlights, ER emergency transfusion dispatches, cold-chain storage locker telemetry, and laboratory cross-matching audit log.
- **Express Backend API**: REST endpoints for authentication, donor scheduling, hospital verification, stock query, and emergency requisitions.
