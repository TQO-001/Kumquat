# mPOS Technical Architecture Document
**Version**: 1.0  
**Date**: August 6, 2025  
**Owner**: Technical Lead  
**Status**: Ready for Implementation

---

## Architecture Overview

### System Context
The mPOS system operates in a **challenging connectivity environment** with **resource-constrained devices**. Our architecture prioritizes **offline-first functionality** with **eventual consistency** when network becomes available.

### Core Principles
1. **Offline-First**: All critical functions work without internet
2. **Mobile-Responsive**: Optimized for 2GB RAM Android devices  
3. **Conflict-Free**: Automatic resolution of concurrent offline changes
4. **Progressive Enhancement**: Advanced features load when network available
5. **Modular Design**: Clean boundaries for future SaaS module integration

---

## System Architecture

### High-Level Component Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (PWA)                             │
├─────────────────────────────────────────────────────────────┤
│  React UI Layer                                             │
│  ├── Sales Screen      ├── Receipt Screen                   │
│  ├── Products Screen   ├── Settings Screen                  │
│  └── Sync Status       └── Reports Screen                   │
├─────────────────────────────────────────────────────────────┤
│  Application Services                                       │
│  ├── Sales Service     ├── Receipt Service                  │
│  ├── Product Service   ├── Sync Service                     │
│  └── Storage Service   └── WhatsApp Service                 │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── IndexedDB (Local) ├── Service Worker (Offline)        │
│  └── Background Sync   └── Conflict Resolution              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/TLS 1.3
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway + Authentication                               │
│  ├── Rate Limiting      ├── Request Validation             │
│  └── JWT Middleware     └── Error Handling                 │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Services                                   │
│  ├── Sync Controller    ├── Sales Controller               │
│  ├── Product Controller ├── Receipt Controller             │
│  └── Tenant Controller  └── Analytics Controller           │
├─────────────────────────────────────────────────────────────┤
│  Data Persistence                                          │
│  ├── PostgreSQL (Primary) ├── Redis (Cache + Queue)       │
│  └── S3 (Receipt Storage) └── CloudWatch (Monitoring)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (Progressive Web App)
```javascript
// Core Framework
React: 18.2.0           // Component framework
TypeScript: 5.0+        // Type safety and developer experience
Vite: 4.3+             // Fast build tool and dev server

// State Management & Data
Zustand: 4.3+          // Lightweight state management
React Query: 4.0+      // Server state and caching
IndexedDB via Dexie: 3.2+ // Local database with reactive queries

// UI & Styling  
Tailwind CSS: 3.3+     // Utility-first CSS framework
Headless UI: 1.7+      // Unstyled accessible components
Framer Motion: 10.0+   // Smooth animations and transitions

// PWA & Offline
Workbox: 6.5+          // Service worker management
Background Sync API    // Offline queue processing
Web Share API          // Native sharing capabilities

// Utilities
date-fns: 2.30+        // Date manipulation and formatting
zod: 3.21+             // Runtime type validation
nanoid: 4.0+           // Unique ID generation
```

### Backend (API Server)
```javascript
// Core Framework
Node.js: 18 LTS        // Runtime environment
Express: 4.18+         // Web application framework
TypeScript: 5.0+       // Type safety

// Database & Caching
PostgreSQL: 14+        // Primary database with JSONB support
Redis: 7.0+            // Caching and session storage
Prisma: 5.0+           // Database ORM with migrations

// Authentication & Security
jsonwebtoken: 9.0+     // JWT token handling
bcrypt: 5.1+           // Password hashing
helmet: 7.0+           // Security headers
rate-limiter-flexible  // Advanced rate limiting

// Validation & Utilities
zod: 3.21+             // Schema validation
winston: 3.8+          // Structured logging
dotenv: 16.0+          // Environment configuration
```

### Infrastructure (AWS)
```yaml
# Container Orchestration
ECS Fargate: Latest    # Serverless container platform
Application Load Balancer # SSL termination and routing

# Databases
RDS PostgreSQL: 14.7   # Multi-AZ deployment for HA
ElastiCache Redis: 7.0 # Cluster mode for scaling

# Storage & CDN
S3: Receipt storage    # Document storage with lifecycle
CloudFront: CDN        # Global content delivery

# Monitoring & Security
CloudWatch: Monitoring # Logs, metrics, and alarms
WAF: Security          # DDoS protection and filtering
Certificate Manager    # SSL/TLS certificate management
```

---

## Data Architecture

### Local Data Model (IndexedDB)
```typescript
// Client-side schema optimized for offline operations
interface LocalSale {
  id: string;              // UUID v4
  localId: string;         // Device-specific ID for conflict resolution
  tenantId: string;        // Business identifier
  items: SaleItem[];       // Product details with quantities
  totalAmount: number;     // Calculated total in cents
  paymentMethod: 'cash' | 'card';
  createdAt: Date;         // Local device timestamp
  syncedAt?: Date;         // Server sync confirmation
  conflictResolved?: boolean; // Sync conflict handling flag
}

interface LocalProduct {
  id: string;
  name: string;
  price: number;           // Price in cents for precision
  barcode?: string;
  category?: string;
  lastModified: Date;      // For incremental sync
  syncVersion: number;     // Optimistic concurrency control
}

interface SyncQueue {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'sale' | 'product';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}
```

### Server Data Model (PostgreSQL)
```sql
-- Multi-tenant architecture for SaaS expansion
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenant isolation table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products with sync versioning
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL, -- Price in cents
    barcode VARCHAR(100),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sync_version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales with conflict resolution metadata
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL, -- For offline conflict resolution
    local_id VARCHAR(50), -- Original device-generated ID
    total_amount INTEGER NOT NULL, -- Amount in cents
    payment_method VARCHAR(20) NOT NULL,
    items JSONB NOT NULL, -- Flexible item storage
    metadata JSONB DEFAULT '{}', -- Extensible for future features
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP DEFAULT NOW(),
    
    -- Conflict resolution constraints
    UNIQUE(tenant_id, device_id, local_id)
);

-- Indexes for performance
CREATE INDEX idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_sales_tenant_date ON sales(tenant_id, created_at DESC);
CREATE INDEX idx_sales_sync ON sales(tenant_id, synced_at) WHERE synced_at IS NOT NULL;
```

### Sync Strategy: Event Sourcing with CRDTs

```typescript
// Conflict-free replicated data type for sales
class SaleCRDT {
  constructor(
    public saleId: string,
    public tenantId: string,
    public deviceId: string,
    public timestamp: Date,
    public items: SaleItem[],
    public totalAmount: number
  ) {}

  // Deterministic conflict resolution
  static resolve(local: SaleCRDT, remote: SaleCRDT): SaleCRDT {
    // Last-writer-wins based on timestamp + device ID tiebreaker
    if (local.timestamp > remote.timestamp) return local;
    if (remote.timestamp > local.timestamp) return remote;
    
    // Timestamp tie: use device ID for consistency
    return local.deviceId > remote.deviceId ? local : remote;
  }
}

// Sync service with batching and retry logic
class SyncService {
  async syncPendingChanges(): Promise<SyncResult> {
    const pendingOperations = await this.getSyncQueue();
    const batchSize = 50; // Prevent large payloads on slow connections
    
    for (const batch of chunk(pendingOperations, batchSize)) {
      try {
        await this.syncBatch(batch);
        await this.markBatchSynced(batch);
      } catch (error) {
        await this.handleSyncError(batch, error);
      }
    }
  }
  
  private async handleSyncError(batch: SyncOperation[], error: Error) {
    // Exponential backoff for transient failures
    for (const operation of batch) {
      operation.retryCount++;
      operation.nextRetry = new Date(Date.now() + Math.pow(2, operation.retryCount) * 1000);
    }
  }
}
```

---

## Offline-First Architecture

### Service Worker Implementation
```typescript
// Advanced caching strategy for PWA
const CACHE_NAME = 'mpos-v1.0.0';
const CRITICAL_RESOURCES = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CRITICAL_RESOURCES))
  );
});

// Network-first strategy for API calls with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: return cached response or offline indicator
          return caches.match(event.request)
            .then(cached => cached || new Response(
              JSON.stringify({ offline: true, timestamp: Date.now() }),
              { headers: { 'Content-Type': 'application/json' }}
            ));
        })
    );
  }
});

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingOperations());
  }
});
```

### Local Storage Strategy
```typescript
// Optimized IndexedDB wrapper with reactive queries
class LocalDatabase {
  private db: Dexie;
  
  constructor() {
    this.db = new Dexie('mPOSDatabase');
    this.db.version(1).stores({
      sales: '++id, tenantId, createdAt, syncedAt',
      products: '++id, tenantId, name, barcode, lastModified',
      syncQueue: '++id, timestamp, retryCount',
      settings: 'key'
    });
  }
  
  // Reactive query with automatic UI updates
  async getSalesWithUpdates(tenantId: string): Promise<Observable<Sale[]>> {
    return this.db.sales
      .where('tenantId').equals(tenantId)
      .orderBy('createdAt')
      .toArray()
      .then(sales => new BehaviorSubject(sales));
  }
  
  // Optimistic updates with rollback capability
  async addSaleOptimistic(sale: Sale): Promise<void> {
    const transaction = this.db.transaction('rw', [this.db.sales, this.db.syncQueue], async () => {
      await this.db.sales.add(sale);
      await this.db.syncQueue.add({
        operation: 'CREATE',
        entityType: 'sale',
        data: sale,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 5
      });
    });
    
    return transaction;
  }
}
```

---

## API Design

### RESTful Endpoints with Batch Operations
```typescript
// Sync endpoint optimized for mobile bandwidth
POST /api/v1/sync
Content-Type: application/json
Authorization: Bearer <jwt_token>

Request:
{
  "deviceId": "device_samsung_a10s_001",
  "lastSyncTimestamp": "2025-08-06T10:30:00Z",
  "pendingOperations": [
    {
      "type": "CREATE_SALE",
      "localId": "sale_offline_001",
      "data": {
        "items": [
          { "productId": "prod_123", "quantity": 2, "price": 1500 }
        ],
        "totalAmount": 3000,
        "paymentMethod": "cash",
        "createdAt": "2025-08-06T14:22:00Z"
      }
    }
  ]
}

Response:
{
  "syncTimestamp": "2025-08-06T15:00:00Z",
  "serverChanges": {
    "products": [
      {
        "id": "prod_456",
        "name": "New Product",
        "price": 2500,
        "lastModified": "2025-08-06T14:45:00Z"
      }
    ],
    "sales": []
  },
  "conflicts": [],
  "acknowledgments": [
    {
      "localId": "sale_offline_001",
      "serverId": "sale_server_789",
      "status": "created"
    }
  ]
}

// Real-time receipt generation
POST /api/v1/receipts/generate
{
  "saleId": "sale_123",
  "format": "whatsapp", // or "print", "pdf"
  "language": "en"      // or "af", "zu"
}

Response:
{
  "receiptText": "🧾 *RECEIPT*\n📍 Nomsa's Spaza\n...",
  "whatsappUrl": "https://wa.me/?text=...",
  "pdfUrl": "https://receipts.mpos.com/receipt_123.pdf"
}
```

### GraphQL for Complex Queries (Future Enhancement)
```graphql
# Advanced reporting queries for premium features
type Query {
  salesAnalytics(
    tenantId: ID!
    dateRange: DateRange!
    groupBy: GroupByPeriod
  ): SalesAnalytics
  
  topProducts(
    tenantId: ID!
    limit: Int = 10
    period: Period = LAST_30_DAYS
  ): [ProductSales!]!
}

type SalesAnalytics {
  totalRevenue: Money!
  transactionCount: Int!
  averageTransactionValue: Money!
  dailyBreakdown: [DailySales!]!
  paymentMethodBreakdown: [PaymentMethodSales!]!
}
```

---

## Security Architecture

### Authentication & Authorization
```typescript
// JWT-based authentication with device binding
interface JWTPayload {
  tenantId: string;
  deviceId: string;
  businessName: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Device registration with PIN protection
class DeviceAuth {
  async registerDevice(pin: string, businessDetails: BusinessDetails): Promise<AuthResult> {
    const deviceId = await this.generateDeviceFingerprint();
    const hashedPin = await bcrypt.hash(pin, 12);
    
    const tenant = await this.createTenant({
      ...businessDetails,
      deviceId,
      hashedPin
    });
    
    const token = jwt.sign(
      { tenantId: tenant.id, deviceId, permissions: ['sales:create', 'products:read'] },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    return { token, tenantId: tenant.id };
  }
  
  private async generateDeviceFingerprint(): Promise<string> {
    // Combine device characteristics for unique ID
    const fingerprint = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(
      navigator.userAgent + screen.width + screen.height + navigator.language
    ));
    return Array.from(new Uint8Array(fingerprint))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

### Data Encryption
```typescript
// Local data encryption using Web Crypto API
class LocalEncryption {
  private key: CryptoKey;
  
  async initializeEncryption(pin: string): Promise<void> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(pin.padEnd(32, '0')),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('mpos-salt-v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encryptSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoder.encode(data)
    );
    
    // Combine IV and encrypted data for storage
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
}
```

---

## Performance Optimization

### Mobile-First Performance Budget
```typescript
// Performance monitoring and enforcement
const PERFORMANCE_BUDGET = {
  // Core Web Vitals for mobile
  LCP: 2500,      // Largest Contentful Paint
  FID: 100