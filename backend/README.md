# LifeVault Backend Server

Express.js RESTful API Backend for LifeVault BBMS. Handles authentication, inventory management, hospital requisitions, donor management, FEFO queue algorithms, and blood compatibility checks.

## Quick Start (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

3. Start backend development server:
   ```bash
   npm run dev
   ```
   The backend API will listen on `http://localhost:5000/api/v1` and health check at `http://localhost:5000/health`.

## API Endpoints Overview
- `GET /health` - Service health status
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/inventory` - Fetch blood stock & cold-chain telemetry
- `POST /api/v1/requisition` - Emergency blood dispatch request
- `GET /api/v1/donors` - Retrieve donor registry & appointments
- `GET /api/v1/hospitals` - Retrieve affiliated hospital status

## Deployment

1. Run production server:
   ```bash
   npm start
   ```

2. Container / PaaS Deployment:
   - **Docker / Render / Railway / Heroku**: Set root directory to `backend`, entrypoint `node server.js`, set `PORT` environment variable.
