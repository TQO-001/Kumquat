# 🎨 Brutalist mPOS UI Style Guide

## **1. Color Palette**

| Name               |  Color  | Hex       | Usage                                               |
| ------------------ | :-----: | --------- | --------------------------------------------------- |
| **Deep Orange**    | #FF6B00 | `#FF6B00` | _Primary: Complete Sale button, active icons, CTAs_ |
| **Warm Off-White** | #FDF7F2 | `#FDF7F2` | _Secondary background_                              |
| **Pure White**     | #FFFFFF | `#FFFFFF` | _Base background, surfaces_                         |
| **Charcoal Black** | #1C1C1C | `#1C1C1C` | _Main text color_                                   |
| **Steel Gray**     | #4E4E4E | `#4E4E4E` | _Secondary text color_                              |
| **Sync OK Green**  | #3DBA3D | `#3DBA3D` | _Status: connected/synced_                          |
| **Offline Red**    | #FF3131 | `#FF3131` | _Status: offline/error_                             |

---

## **2. Typography**

**Font Family**

- Primary: `Inter` (Bold / SemiBold)
- Alternatives: `IBM Plex Sans`, `Space Grotesk`  
    _(Wide, geometric, brutalist-friendly fonts)_
    

**Type Sizes & Use**

|Style|Size|Weight|Usage|
|---|---|---|---|
|`H1`|`28px`|Bold|Screen titles|
|`H2`|`20px`|Bold|Section headers|
|`Body`|`16px`|Regular|Paragraphs, secondary text|
|`Buttons`|`18px`|Bold Uppercase|Primary actions|
|`Prices`|`16px`|Roboto Mono|Aligned numerics (monospace)|

---

## **3. Brutalist UI Elements**

- ✅ **Solid Color Blocks** — no gradients, no shadows
- ⬛ **Hard Edges** — only 90° corners
- 👇 **Oversized Buttons** — big tap targets, loud layout
- 🔢 **Monospace Numbers** — especially for prices, totals
- 📏 **Border-Only Layouts** — thick black lines to separate sections
- 🔲 **Flat Minimal Icons** — 1px stroke, black or white only

---

## **4. Screen Concepts**

### 🛒 **Sales Screen**

- **Header**:
    - White background
    - Thick black border
    - Business name in **ALL CAPS**, centered

- **Product Grid**:
    
    - White tiles
        
    - Black borders
        
    - **Orange fill on tap** (`#FF6B00`)
        
- **Cart Section**:
    
    - Total in **orange (`#FF6B00`) on black**
        
    - Monospace digits for totals
        
- **Complete Sale Button**:
    
    - Full-width
        
    - Background: `#FF6B00`
        
    - Text: **Black, UPPERCASE, Bold**
        

---

### 🧾 **Receipt Screen**

- **Header**: Black background
    
- **Body**: White with minimal dividers
    
- **Accent Totals**: Orange text highlights
    
- **WhatsApp Share Button**:
    
    - Background: `#3DBA3D`
        
    - Text: **White, Uppercase, Bold**
        

---

Want to go deeper?  
I can extend this into a **component spec** with:

- Button states (hover, active, disabled)
    
- Spacing system (e.g., 8pt grid)
    
- Reusable component tokens
    
- Sample code snippets (React, Flutter, etc.)
    

👉 Just say the word if you want the full dev handoff.