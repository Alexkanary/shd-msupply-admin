# SHD M Supply System: Admin Dashboard

A clinic medicine stock management and cold chain monitoring dashboard built for remote and border health outposts in the Special Health Division. It operates on the **Report & Requisition model** (periodic stock reports, not per-transaction invoicing) as a simplified alternative to Open mSupply.

---

## ⚠️ Important Security Notice: Default Admin Credentials

The system ships with **one embedded default administrator account** for first-time setup:

| Field | Value |
|---|---|
| **Default Username** | `admin` |
| **Default Password** | `admin123` |

> 🔒 **Action Required Upon First Login:**  
> Navigate to **Settings** immediately after your first sign-in and update both the username and password. Once changed, the default credential is permanently invalidated.

---

## Key Features

1. **Clinics Directory**: Register and manage clinics with unique Clinic IDs (e.g., `ML-01`, `WP-02`), physical locations, active status, and last reported dates.
2. **Periodic Reports Inbox**: View weekly and monthly stock reports submitted from clinic tablets (item names, lot numbers, quantities on hand, quantities consumed).
3. **Stock by Lot / Batch**: Every medicine tracked by lot number with individual expiry dates and storage assignments.
4. **Color-Coded Batch Expiry Engine**:
   - 🟢 **Green (Healthy)**: More than 6 months remaining.
   - 🟡 **Amber (Warning)**: Expiring within 3 to 6 months.
   - 🔴 **Red (Urgent)**: Expiring within 3 months or already expired.
5. **Cold Chain Monitoring**:
   - **Equipment Registry**: Manage solar refrigerators, freezers, and cold boxes with target ranges (e.g. 2°C–8°C for fridges, -20°C for freezers).
   - **Excursion Detection & Alerting**: Automatic flagging of readings outside safe limits, severity scoring, duration calculation, and clinic response recording.
   - **Stock at Risk**: Automatic listing of cold-chain medicine batches stored in any unit suffering an excursion.
   - **Missed Readings / Overdue**: Highlights equipment without logs in the expected interval (>12 hours).
   - **Continuous Charts**: Visual line charts with shaded safe bands and temperature threshold markers using Recharts.
   - **WHO PQS Temperature Log Sheet**: Print-ready temperature record sheet for physical binder audits.
6. **Requisition & Resupply (No Courier/Shipping)**:
   - Clinics submit requisitions for supplies.
   - Admin reviews and adjusts **approved quantities**.
   - Resupply is carried out directly by car: status transitions from `Pending` &rarr; `Approved` &rarr; `Fulfilled`.
   - **Print-Friendly Pharmacy Pull Sheet**: `@media print` optimized pull sheet complete with timestamp, real timezone, requested vs approved quantities, and signature verification blocks for pharmacist and driver.
7. **Live Device Time Zone**:
   - Top-bar live clock updating every second with real device time zone (e.g. `Fri, 16 Oct 2026, 14:08:05 GMT+7 (Asia/Bangkok)`).
   - All dates and timestamps across tables and print sheets are formatted in the selected time zone.
   - Time zone is configurable in Settings, defaulting to device time zone.
8. **Medicine & Materials Catalog**:
   - Manage master list with category, unit, reorder thresholds, and storage requirements (`Ambient`, `Cold Chain 2-8°C`, or `Frozen`).
9. **Simulate Clinic Sync Drawer**:
   - Built-in test simulator to transmit weekly reports, requisitions, or excursion events from virtual clinic tablets with one click.

---

## Project Structure

```text
├── Dockerfile                  # Multi-stage production build (Node + Nginx Alpine)
├── docker-compose.yml          # Production container setup with healthchecks
├── .dockerignore               # Clean container build exclusions
├── .env.example                # Environment variables template
├── docker/
│   ├── nginx.conf              # SPA fallback, gzip compression, cache headers
│   └── entrypoint.sh           # Generates /config.js from container env vars at boot
├── public/
│   └── config.js               # Runtime configuration placeholder
├── src/
│   ├── components/
│   │   ├── auth/LoginView.tsx          # Username/password sign-in
│   │   ├── layout/Sidebar.tsx          # Navigation sidebar & credit
│   │   ├── layout/TopBar.tsx           # Live clock, timezone & quick actions
│   │   ├── dashboard/DashboardOverview.tsx # KPI widgets, soonest-expiring batches
│   │   ├── clinics/ClinicsView.tsx     # Clinics CRUD
│   │   ├── reports/ReportsView.tsx     # Reports inbox & line breakdown
│   │   ├── stock/StockView.tsx         # Lot/batch stock & expiry filters
│   │   ├── requisitions/RequisitionsView.tsx # Order review & pharmacy print pull sheet
│   │   ├── coldchain/ColdChainView.tsx # Equipment, excursions, logs & WHO print sheet
│   │   ├── items/ItemsCatalogView.tsx  # Medicine master catalog
│   │   ├── charts/AnalyticsView.tsx    # Recharts trends & cross-clinic comparisons
│   │   ├── settings/SettingsView.tsx   # Password change, timezone & API config
│   │   └── modals/SimulateSyncModal.tsx # Clinic tablet event simulator
│   ├── services/
│   │   ├── api.ts              # Typed API layer (REST backend + mock fallback)
│   │   ├── auth.ts             # Session & credential state
│   │   ├── mockData.ts         # Realistic clinical & cold chain seed data
│   │   └── time.ts             # Real timezone formatting & expiry calculation
│   ├── types/index.ts          # Core TypeScript domain models
│   ├── App.tsx                 # Main layout & tab router
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind CSS & print media rules
└── vite.config.ts
```

---

## Local Development (Node.js)

To run the dashboard locally for development:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview build output
npm run preview
```

Open `http://localhost:3000` in your browser and sign in with `admin` / `admin123`.

---

## Production Deployment with Docker on Ubuntu

### 1. Prerequisites
Ensure Docker and Docker Compose are installed on your Ubuntu host:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
nano .env
```
Set your desired `API_BASE_URL` (or leave blank to use the standalone in-memory/localStorage engine) and `DEFAULT_TIMEZONE` (e.g. `Asia/Bangkok`).

### 3. Build & Launch Containers
```bash
# Build and run in detached mode
docker compose up -d --build

# Inspect running containers
docker compose ps

# View live container logs
docker compose logs -f admin-dashboard
```

The dashboard will be reachable at `http://<your-server-ip>:8080`.

### 4. Updating the Dashboard
```bash
git pull origin main
docker compose up -d --build
```

### 5. Stopping the Dashboard
```bash
docker compose down
```

---

## Cloudflare Tunnel Setup (HTTPS & Remote Access)

To make the dashboard accessible via a secure, zero-trust domain without opening incoming firewall ports:

1. In the **Cloudflare Zero Trust Dashboard**, create a new Tunnel under **Networks &rarr; Tunnels**.
2. Add a Public Hostname route (e.g. `admin.yourdomain.org`) pointing to:
   - **Service**: `HTTP`
   - **URL**: `shd-admin-dashboard:80` (or `localhost:8080` if running directly on the host)
3. Uncomment the `cloudflared` service in `docker-compose.yml` and provide your `CLOUDFLARE_TUNNEL_TOKEN` in `.env`.
4. Run `docker compose up -d` to bring up the tunnel.

---

## Runtime Configuration Mechanics

The Docker image is built once and runs anywhere without rebuilding:
- Upon container boot, `/entrypoint.sh` reads `API_BASE_URL` and `DEFAULT_TIMEZONE` from environment variables.
- It writes `/usr/share/nginx/html/config.js` with:
  ```javascript
  window.__CONFIG__ = {
    API_BASE_URL: "https://api.yourdomain.org",
    DEFAULT_TIMEZONE: "Asia/Bangkok"
  };
  ```
- The application reads `window.__CONFIG__` before mounting. Users can also override this anytime in the **Settings** view.

---

## License & Attribution

Part of the **SHD M Supply System**.  
*Made by Saidar (SHD)*
