# Docker & Local Development Setup

Quick guide to run, monitor, view logs, and stop LifeVault BBMS.

---

## 1. Run with Docker (Containers)

### Start in Background (Recommended)
```bash
docker compose up -d --build
```
> Starts Frontend and Backend containers in the background. Backend connects directly to MongoDB Atlas.

### Access Points
* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API Health**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 2. View Terminal Prints & Logs

### In Docker Mode (View `console.log` and Server Prints)
```bash
# View backend prints (node server.js logs, db connection, requests)
docker compose logs -f backend

# View frontend prints (Nginx access & error logs)
docker compose logs -f frontend

# View both services together
docker compose logs -f

# View last 50 lines of backend logs
docker compose logs --tail=50 -f backend
```
> Press `Ctrl + C` anytime to stop viewing logs (containers keep running).

### View Detailed Build Output (See `npm install` and Vite Build Prints)
If you want to see all terminal prints during image build:
```bash
docker compose build --progress=plain
```

---

## 3. Run Locally Without Docker (Direct Terminal Prints)

If you prefer developing on your host machine to see direct terminal outputs:

### Option A: Run Both Together (from Project Root)
```bash
npm run dev
```
> Runs frontend and backend concurrently with color-coded terminal prefixes (`FRONTEND` in cyan, `BACKEND` in magenta).

### Option B: Run Individually in Separate Terminals
```bash
# Terminal 1: Backend
cd backend
npm install
node server.js      # or: npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

---

## 4. Check Status & Performance

### View Running Containers
```bash
docker compose ps
```

### View Live Performance (CPU & RAM Usage)
```bash
docker stats
```
> Press `Ctrl + C` to exit.

---

## 5. Stop Containers

### Stop All Docker Services
```bash
docker compose down
```
