# LifeVault Frontend Application

Modern React + Vite + TailwindCSS application for the LifeVault Blood Banking & Telemetry Management System.

## Features
- Interactive Dashboard (Inventory, Telemetry, Requisitions, FEFO Queues)
- Emergency Request & Blood Match Portal
- Hospital Management & Donor Scheduling System
- Responsive Liquid Glass Dark Mode Design

## Quick Start (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Independent Production Build & Deployment

1. Build static production assets:
   ```bash
   npm run build
   ```
   Output bundle is emitted to `dist/`.

2. Preview production build locally:
   ```bash
   npm run preview
   ```

3. Deploying:
   - **Vercel / Netlify / Cloudflare Pages**: Connect the repository and set root directory to `frontend`. Build command: `npm run build`, Output directory: `dist`.
   - **Nginx / Static Host**: Serve the generated contents of the `frontend/dist` directory.
