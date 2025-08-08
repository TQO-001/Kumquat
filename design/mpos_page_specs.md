# mPOS MVP - Detailed Page Specifications
**Version**: 1.0  
**Date**: August 8, 2025  
**Status**: Ready for Development

---

## 📱 Page-by-Page Component Breakdown

### 1. Sales Screen (Main Dashboard)
**Route**: `/` (Default landing page)  
**User Story**: Complete a sale in <90 seconds  
**Priority**: Critical Path - Week 2

#### Header Component
```typescript
interface HeaderProps {
  businessName: string;
  syncStatus: 'online' | 'offline' | 'syncing';
  pendingCount: number;
  currentLanguage: 'en' | 'af' | 'zu';
  onLanguageChange: (lang: string) => void;
}
```

**Elements**:
- Business name (customizable)
- Sync status indicator with animated pulse
- Language toggle dropdown
- Settings gear icon (top right)
- Current time display

#### Search & Quick Actions
**Elements**:
- Search input with debounced fuzzy matching
- Barcode scan button (camera integration)
- Voice search button (future enhancement)
- "Add New Product" quick action
- Recent searches dropdown

**Search Functionality**:
- Minimum 2 characters to trigger search
- Search across: product name, barcode, category
- Typo tolerance (Levenshtein distance ≤2)
- Results sorted by: exact match → usage frequency → alphabetical

#### Product Grid Component
```typescript
interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  layout: 'grid' | 'list';
  categoryFilter?: string;
}
```

**Grid Layout**:
- 2 columns on mobile portrait
- 3 columns on mobile landscape
- 4 columns on tablet
- Auto-sizing product cards

**Product Card Elements**:
- Product image (placeholder if none)
- Product name (truncated at 2 lines)
- Price in large, bold text
- Quick add button (+)
- Out of stock indicator
- Popular item badge

#### Shopping Cart Component
**States**:
- Empty state with encouraging message
- Active state with items list
- Collapsible/expandable
- Drag to reorder items

**Cart Item Elements**:
- Product name and thumbnail
- Quantity controls (-/+)
- Individual line total
- Remove item button
- Edit item button (price override)

**Cart Summary**:
- Subtotal calculation
- Tax calculation (if applicable)
- Total in prominent display
- Item count badge

#### Action Buttons
- **Complete Sale** (primary CTA)
- **Clear Cart** (secondary)
- **Save for Later** (tertiary)
- **Apply Discount** (if enabled)

---

### 2. Payment Screen
**Route**: `/payment`  
**Navigation**: From sales screen after "Complete Sale"  
**User Story**: Process payment in <30 seconds

#### Order Summary Component
**Elements**:
- Itemized list with quantities
- Subtotal, tax, total breakdown
- Edit cart button (returns to sales screen)
- Customer information (optional)

#### Payment Method Selection
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  requiresInput: boolean;
}
```

**Available Methods**:
- **Cash** (default, always enabled)
- **Card** (future integration ready)
- **Mobile Money** (future: EFT, SnapScan)
- **Credit** (account customers)

#### Cash Payment Calculator
**Elements**:
- Amount received input (numeric keypad)
- Change calculation (auto-updated)
- Suggested amount buttons (R20, R50, R100, R200)
- Exact change indicator
- Large, clear change display

#### Payment Processing
**Flow**:
1. Select payment method
2. Enter required details
3. Process payment (loading state)
4. Success confirmation
5. Navigate to receipt screen

**Validation**:
- Cash: amount received ≥ total
- Card: integration with payment gateway
- Error handling for failed payments

---

### 3. Receipt Screen
**Route**: `/receipt/:saleId`  
**User Story**: Share receipt via WhatsApp in <10 seconds

#### Receipt Preview Component
```typescript
interface ReceiptData {
  saleId: string;
  businessInfo: BusinessInfo;
  items: SaleItem[];
  totals: SaleTotals;
  paymentMethod: string;
  timestamp: Date;
  customer?: CustomerInfo;
}
```

**Receipt Layout**:
- Business header (logo, name, contact)
- Transaction details (date, time, sale number)
- Itemized list with quantities and prices
- Payment summary (subtotal, tax, total)
- Payment method and change given
- Footer message (thank you, return policy)
- QR code (future: transaction verification)

#### Multi-Language Receipt Templates
**English Template**:
```
🧾 RECEIPT
📍 {businessName}
📞 {phone} | 📧 {email}
📅 {date} ⏰ {time}
Transaction: #{saleId}

📦 ITEMS:
{itemList}

💰 TOTAL: R{total}
Payment: {paymentMethod}
Change: R{change}

Thank you for your business! 😊
```

**Afrikaans Template**:
```
🧾 KWITANSIE
📍 {businessName}
📞 {phone} | 📧 {email}
📅 {date} ⏰ {time}
Transaksie: #{saleId}

📦 ITEMS:
{itemList}

💰 TOTAAL: R{total}
Betaling: {paymentMethod}
Kleingeld: R{change}

Dankie vir jou besigheid! 😊
```

**isiZulu Template**:
```
🧾 IRISIDI
📍 {businessName}
📞 {phone} | 📧 {email}
📅 {date} ⏰ {time}
Ukuthenga: #{saleId}

📦 IZINTO:
{itemList}

💰 ISAMBA: R{total}
Ukukhokha: {paymentMethod}
Ushintshi: R{change}

Ngiyabonga ngokuthenga! 😊
```

#### Share Options Component
**Share Methods**:
1. **WhatsApp** (primary)
   - Direct to contact (if phone number provided)
   - Generic share (user selects contact)
   - Formatted message with receipt text

2. **SMS** (fallback)
   - Text-only receipt format
   - Automatic recipient detection

3. **Email** (business customers)
   - PDF attachment
   - HTML formatted email

4. **Print** (thermal printer)
   - ESC/POS command generation
   - Bluetooth printer discovery
   - Print preview

5. **Save/Export**
   - Save to device photos
   - Export as PDF
   - Add to contacts (business card mode)

#### WhatsApp Integration Flow
```typescript
const shareViaWhatsApp = (receipt: ReceiptData, phone?: string) => {
  const message = formatReceiptForWhatsApp(receipt);
  const url = phone 
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `whatsapp://send?text=${encodeURIComponent(message)}`;
  
  if (canOpenWhatsApp()) {
    window.open(url);
  } else {
    fallbackToGenericShare(message);
  }
};
```

---

### 4. Products Management Screen
**Route**: `/products`  
**User Story**: Manage product catalog offline-first

#### Product List Component
**View Options**:
- Grid view (default)
- List view (detailed)
- Category filtered view
- Search filtered view

**List Features**:
- Infinite scroll loading
- Pull-to-refresh
- Bulk selection mode
- Sort options (name, price, usage, date added)

#### Product Card (Detailed)
**Elements**:
- Product image/thumbnail
- Product name and description
- Price with currency formatting
- Barcode (if available)
- Category tag
- Stock status indicator
- Last modified date
- Sync status badge
- Quick action menu (edit, delete, duplicate)

#### Add/Edit Product Form
**Form Fields**:
```typescript
interface ProductForm {
  name: string;           // Required
  price: number;          // Required, in cents
  barcode?: string;       // Optional, validated
  category?: string;      // Optional, autocomplete
  description?: string;   // Optional
  image?: File;          // Optional, compressed
  cost?: number;         // Optional, for profit tracking
  stockQuantity?: number; // Optional, for inventory
}
```

**Validation Rules**:
- Name: 1-100 characters, required
- Price: positive number, max 999999.99
- Barcode: valid format (EAN-13, UPC-A, etc.)
- Image: max 5MB, compressed to <1MB
- Category: selected from existing or new

#### Barcode Scanner Integration
**Camera Scanner**:
- Live camera feed with overlay
- Scan guidelines and target area
- Auto-focus and flash controls
- Manual barcode entry fallback
- Multiple format support

**Scan Results**:
- Product lookup in database
- Create new product if not found
- Bulk scanning mode
- Scan history

#### Sync Status Management
**Sync Indicators**:
- ✅ Synced (green checkmark)
- ⏳ Pending sync (orange clock)
- ❌ Sync failed (red X with retry)
- 🔄 Syncing (animated spinner)

**Sync Actions**:
- Manual sync trigger
- Bulk sync all pending
- Conflict resolution interface
- Sync history view

---

### 5. Settings Screen
**Route**: `/settings`  
**User Story**: Configure app for business needs

#### Business Information Section
**Fields**:
- Business name (required)
- Owner/Manager name
- Phone number (for receipts)
- Email address (for exports)
- Physical address (multi-line)
- Business registration number
- VAT number (if applicable)
- Logo upload (compressed, optimized)

#### Receipt Customization
**Options**:
- Receipt header text
- Footer message
- Thank you message
- Return policy text
- Contact information display
- QR code inclusion
- Receipt numbering format

#### Language & Localization
**Settings**:
- UI language selection
- Receipt language (can differ from UI)
- Date format preference
- Number format preference
- Currency symbol and placement
- Time zone setting

#### Security Settings
**Options**:
- PIN change interface
- Auto-lock timeout (1, 5, 10, 30 minutes)
- Biometric authentication (future)
- Two-factor authentication (future)
- Device encryption status
- Remote wipe capability (future)

#### Printer Setup
**Bluetooth Printer Pairing**:
- Device discovery
- Connection testing
- Print sample receipt
- Printer settings (paper size, density)
- Multiple printer support

#### Data Management
**Options**:
- Export all data (CSV, JSON)
- Backup to cloud (encrypted)
- Restore from backup
- Clear cache and temporary files
- Reset app to defaults
- Data usage statistics

#### Sync & Connectivity
**Settings**:
- Auto-sync preferences
- WiFi-only sync option
- Data usage monitoring
- Sync frequency settings
- Conflict resolution preferences
- Offline mode indicators

---

### 6. Reports/Dashboard Screen
**Route**: `/reports`  
**User Story**: Basic business intelligence (Should Have)

#### Quick Stats Cards
**Metrics**:
- Today's revenue
- Today's transaction count
- This week comparison
- Best selling product today
- Average transaction value
- Cash vs card ratio

#### Sales Chart Component
```typescript
interface SalesChartProps {
  data: SalesData[];
  timeframe: 'day' | 'week' | 'month';
  chartType: 'line' | 'bar' | 'pie';
}
```

**Chart Types**:
- Daily sales trend (line chart)
- Hourly patterns (bar chart)
- Payment method breakdown (pie chart)
- Product category performance
- Week-over-week comparison

#### Recent Transactions List
**Elements**:
- Last 20 transactions
- Transaction details on tap
- Search and filter options
- Export selected transactions
- Refund/void capabilities (future)

#### Export Options
**Formats**:
- CSV for accounting software
- PDF summary report
- Email automated reports
- Date range selection
- Custom report builder (future)

---

### 7. Offline Mode Considerations

#### Offline Indicators
**Visual Elements**:
- Persistent offline banner
- Sync queue counter
- Last sync timestamp
- Connection status in header
- Offline-specific messaging

#### Sync Queue Management
**Queue Display**:
- Pending operations count
- Individual operation details
- Retry failed operations
- Clear completed operations
- Sync priority ordering

#### Conflict Resolution Interface
**Conflict Types**:
- Price changes during offline period
- Product deletions/updates
- Duplicate sales (same device)
- Time synchronization issues

**Resolution Options**:
- Accept server version
- Keep local version
- Merge changes
- Manual resolution
- Skip and resolve later

---

### 8. Error States & Recovery

#### Network Error Handling
**Error Types**:
- Connection timeout
- Server unavailable
- Authentication failure
- Sync conflicts
- Data corruption

**Recovery Actions**:
- Automatic retry with backoff
- Manual retry option
- Fallback to cached data