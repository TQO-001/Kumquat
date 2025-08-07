# 🧾 mPOS MVP — Offline-First Point-of-Sale for Informal Traders

A lightweight, production-ready mobile Point-of-Sale system built for informal traders in South Africa. This MVP empowers small businesses in townships and rural areas to record sales, generate receipts, and manage basic inventory **without needing constant internet access**.

> ⚠️ This is the MVP release focused on offline-first sales processing and WhatsApp-based receipt delivery. Future modules (CRM, invoicing, e-commerce) will build on this core.

---

## 🚀 What It Does
- ✅ **Offline Sales Tracking**  
  Traders can record transactions even during complete network outages. All sales are stored locally using IndexedDB and synced when a connection is restored.

- ✅ **WhatsApp Receipt Delivery**  
  Receipts can be sent to customers via WhatsApp with a single tap — the most used communication tool in the region.

- ✅ **Multilingual Support**  
  Built-in translations for English, Afrikaans, and Zulu to support local language preferences.

- ✅ **Low-End Android Optimization**  
  Designed to run smoothly on 2GB RAM Android 8+ devices, with fast load times and low memory use.

- ✅ **Modular Architecture**  
  The system is designed to expand into a full SaaS platform with future modules for CRM, invoicing, stock management, and e-commerce.

---

## 🧑‍💻 Tech Stack

| Layer         | Tech                                                                 |
|---------------|----------------------------------------------------------------------|
| **Frontend**  | React 18, TypeScript, Tailwind CSS, PWA (Progressive Web App)       |
| **Backend**   | Node.js, Express.js, PostgreSQL, Server-Sent Events (SSE)           |
| **Offline DB**| IndexedDB (via custom service wrapper)                              |
| **Sync Logic**| Event sourcing + CRDTs for conflict resolution                      |
| **Deployment**| Docker, AWS (Fargate, RDS, CloudFront), GitHub Actions (CI/CD)      |

---

## 🗺️ Project Structure
```

mpos-mvp/  
├── frontend/ # React PWA (Sales UI, Receipt Generation)  
├── backend/ # Node.js API (Sync, Auth, Sales Storage)  
├── infrastructure/ # Docker, Terraform, Deployment Scripts  
└── docs/ # Architecture Diagrams, API Specs, UAT Results

````

---
## 🏁 Quick start
### Requirements
- Node.js 18+
- Docker
- Git

### Local Setup
```bash
git clone https://github.com/yourorg/mpos-mvp.git
cd mpos-mvp

# Start backend API
cd backend
npm install && npm run dev

# Start frontend
cd ../frontend
npm install && npm run dev
````

### Docker (Optional)
```bash
docker-compose up --build
```

---

## 📦 Core Features (MVP Scope)
### 📍 Offline Sales Engine
- Local-first data layer
- Syncs via background job
- Handles low-memory devices

### 🧾 Receipt Generation
- WhatsApp share button
- Multi-language support
- Optional Bluetooth printer support

### 🛍️ Product Catalog
- Fast fuzzy search
- Barcode support (future)
- Sorted by usage frequency

---

## 🔐 Security
- Local DB encryption (SQLite or IndexedDB)
- PIN-based authentication
- TLS 1.3 for all server communications
- Auto-lock after 5 minutes inactivity
- Cloud backup available if connected

---

## 🧪 Testing & QA
- ✅ Offline/online integration tests
- ✅ Device compatibility testing on 2GB RAM Androids
- ✅ Performance budget (<3s transaction flow)
- ✅ UAT with real informal traders (Soweto, Cape Flats)

Run tests:

```bash
npm run test
npm run test:offline
npm run test:sync
```

---

## 📈 Success Metrics

|Metric|Goal|
|---|---|
|Transaction Time|< 3 seconds|
|Sync Latency (P95)|< 10 seconds|
|WhatsApp Receipt Share Rate|> 70% of transactions|
|UAT Completion Rate|> 90% without guidance|
|Device Compatibility|95% of Android 8+ devices|

---

## 🧱 Roadmap (Post-MVP)
-  CRM Module – Track customers, loyalty features
-  Advanced Inventory – Multi-location, stock alerts
-  Invoicing – Full B2B sales documentation
-  Bluetooth Printing – Native thermal printer support
-  SMS Receipts – For non-WhatsApp users
-  Cloud Sync Dashboard – Business owner reporting tools

---

## 🤝 Acknowledgements
This project is purpose-built to serve the backbone of the South African economy: informal traders who operate in challenging conditions with limited access to digital infrastructure. We’re building with them, not just for them.

---

## 📬 Feedback or Issues?
**Tough.**