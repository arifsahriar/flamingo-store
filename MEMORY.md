# FLAMINGO (925 Sterling Silver Jewelry) — Project Architecture & Memory

> **Brand**: FLAMINGO • **Tagline**: *"Elegance That Endures"*  
> **Specialty**: Premium 925 Sterling Silver Jewelry with Rhodium & Anti-Tarnish Finish in Bangladesh.

---

## 1. Tech Stack & Environment
- **Framework**: Next.js 16+ (App Router, Turbopack enabled)
- **Styling**: Tailwind CSS, PostCSS, Lucide React Icons
- **Animation & Gestures**: Framer Motion (used in Tinder-style Swipe shopping)
- **Client Storage**: Browser `localStorage` with reactive React Context providers for state synchronization

---

## 2. Global State Architecture

| Context | Storage Key | Description & Responsibilities |
|---|---|---|
| [`SiteConfigContext`](src/context/SiteConfigContext.jsx) | `flamingo_site_config` | Dynamic brand name, tagline, logo URL & height, color palette (`primaryColor`, `accentBgColor`), font family, delivery charges (`deliveryChargeInsideDhaka`, `deliveryChargeOutsideDhaka`), and active promo/referral coupons list. |
| [`ProductsContext`](src/context/ProductsContext.jsx) | `flamingo_products` | Reactive product catalog with fallback to initial `PRODUCTS` ([`src/data/products.js`](src/data/products.js)). Provides `addProduct`, `updateProduct`, `toggleStock`, `deleteProduct`, and `resetToDefault`. Cross-tab synced via `storage` event. |
| [`CartContext`](src/context/CartContext.jsx) | `flamingo_cart` | Shopping bag drawer state, item quantities, subtotal calculation, and clear cart operations. |
| **Orders Store** | `flamingo_orders` | Direct JSON array of placed orders, customer details, item-level dynamic warranty calculations, applied coupons, delivery fees, and order status lifecycle. |

---

## 3. Core Storefront Routes

### `/` — Storefront Home
- **Hero & Value Proposition**: 100% genuine 925 Sterling Silver hallmark certification, anti-tarnish rhodium coating, and cash-on-delivery inspection assurance.
- **Top Bar & Navbar**: Dynamic announcement bar, brand logo, direct links to `/collections`, `/swipe`, `/track-order`, and slide-out cart drawer.
- **Featured Products**: Displays live top items from `ProductsContext` with quick "Add to Cart" triggers.

### `/collections` — Product Catalog
- **Grid Layout**: Displays all active silver jewelry items loaded dynamically from `ProductsContext`.
- **Status & Indicators**: In-stock indicators vs. out-of-stock badges (`স্টক শেষ`).
- **Product Cards**: High-resolution imagery, hover zoom, hallmarks, pricing, and bag addition.

### `/product/[id]` — Dynamic Product Detail Page
- **Interactive Gallery**: Multi-image thumbnail selector and high-definition zoom view.
- **Hallmark & Warranty Pill**: Renders item-specific warranty badges (e.g., `৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি`).
- **Next.js Prerendering**: Wrapped in `<Suspense>` for safe dynamic client hook hydration.

### `/swipe` — Tinder-Style Swipe Shopping
- **Interactive Deck**: Powered by `framer-motion` card drag gestures.
- **Actions**:
  - Drag right / Heart button: Adds item directly to cart and slides to the next piece.
  - Drag left / Cross button: Skips to next piece.
  - Drag up / Details button: Slides open the bottom drawer with detailed specs, purity guarantee, and descriptions.
- **Deck Reset**: Restarts deck on completion without losing added cart items.

### `/checkout` — Cash on Delivery (COD) Checkout
- **Dynamic Delivery Charge**: Pulls inside-Dhaka and outside-Dhaka rates from `SiteConfigContext`.
- **Promo & Referral Coupon Engine**:
  - Real-time coupon code validation against active coupons in `config.coupons`.
  - Computes percentage (`%`) or flat (`৳`) discount.
  - Allows instant coupon removal or reapplication.
- **Dynamic Warranty Expiry Calculation on Order Submission**:
  ```javascript
  orderTimestamp = Date.now();
  expiryTimestamp = item.warrantyDays > 0 ? orderTimestamp + item.warrantyDays * 86400000 : null;
  ```
- **Order ID Generation**: Generates official `FLM-XXXXXX` order IDs.
- **Confirmation Screen**: Shows order summary, customer details, warranty expiration dates, and quick buttons to continue shopping or track order.

### `/track-order` — Customer Order & Live Warranty Tracker
- **Search Engine**: Search by Order ID (`FLM-XXXXXX`) or 11-digit phone number. Supports URL query params (`?orderId=...`).
- **Live Delivery Timeline**: Visual progress tracker across 4 stages (অর্ডার গ্রহণ → প্রসেসিং → কুরিয়ারে হস্তান্তর → ডেলিভারি সম্পন্ন).
- **Live Warranty Countdown**:
  ```javascript
  remainingDays = Math.ceil((item.expiryTimestamp - Date.now()) / (1000 * 60 * 60 * 24));
  ```
  - `remainingDays > 0`: Active warranty badge (`ওয়ারেন্টি সক্রিয়: আর X দিন বাকি`) in emerald green with active **"Claim Warranty / ক্লেইম করুন"** button.
  - `remainingDays <= 0`: Expired badge (`মেয়াদ উত্তীর্ণ`) with disabled claim button.
  - No warranty: `"ওয়ারেন্টি প্রযোজ্য নয়"`.
- **Claim Warranty Invoice & Service Slip Modal**:
  - Modal displaying official warranty claim memorandum with customer info, product details, claim ID (`CLM-XXXXXX`), and safe return packaging instructions.
  - One-click print/download memo button with dedicated `@media print` CSS.

---

## 4. Admin Management Routes

### Unified Admin Navigation
All admin portals share top-level navigation links:
- ⚙️ **থিম সেটিংস** (`/admin/settings`)
- 📦 **অর্ডার ম্যানেজমেন্ট** (`/admin/orders`)
- 💎 **প্রোডাক্ট ক্যাটালগ** (`/admin/products`)
- 🌐 **স্টোরফ্রন্ট** (`/collections`)

### `/admin/settings` — Theme & Brand Control Center
- **Branding & Visuals**: Logo URL, interactive slider for logo height, primary color picker, background pastel shade picker, and serif vs. sans-serif typography.
- **Headlines & Text**: Brand name, tagline, announcement top banner, hero headline, and subheadline.
- **Delivery Configuration**: Inside Dhaka & Outside Dhaka delivery fees (৳).
- **Dynamic Coupon & Referral Creator**: Form to create custom promo codes (Code, percentage or flat discount, and descriptive notes) with quick deletion.

### `/admin/orders` — Order Lifecycle Management
- **Dashboard Metrics**: Total orders, Pending, Delivered, and Total Revenue calculations.
- **Search & Filters**: Search by ID/Customer/Phone, plus status filter tabs.
- **Status Transitions**: Interactive dropdown supporting 5 statuses:
  - `নতুন অর্ডার (Pending)`
  - `প্রসেসিং চলছে (Processing)`
  - `ডেলিভারিতে পাঠানো হয়েছে (Shipped)`
  - `ডেলিভারি সম্পন্ন (Delivered)`
  - `বাতিল করা হয়েছে (Cancelled)`
- **Order Cards**:
  - Clickable `<a href="tel:...">` phone call link.
  - Complete delivery address with selected area.
  - Item listing with readable warranty expiration badges.
  - Financial breakdown with applied coupon badges and deducted discount amounts.
  - Delete order with confirmation.

### `/admin/products` — Product Catalog Manager
- **Product Registry**: Add new silver jewelry items or edit existing items.
- **Fields**: Name, category (`Ring`, `Necklace`, `Bracelet`, `Earrings`), price, original/strikethrough price, main image & additional gallery images, in-stock toggle, short & detailed descriptions.
- **Warranty Configuration**: Enable warranty toggle, duration in days (e.g., 180, 365), and custom warranty text.
- **Table Controls**: Instant stock toggle button (`In Stock` ↔ `Out of Stock`), edit modal opener, and delete with confirmation.
- **Catalog Reset**: Restore default catalog from `src/data/products.js` anytime.

---

## 5. Components Overview

- [`src/components/Footer.jsx`](src/components/Footer.jsx):
  - Automatically hidden on `/admin/*` and `/swipe` routes.
  - 4 Trust Badges: 100% 925 Hallmark, Cash on Delivery, Live Warranty Support, 7-Day Easy Exchange.
  - Dynamic brand name, tagline, and hotline from config.
  - Direct WhatsApp chat link (`https://wa.me/...`), Facebook, phone, and policy popup modals (Delivery, Warranty, Return policies).
- [`src/components/CartDrawer.jsx`](src/components/CartDrawer.jsx): Slide-out drawer showing item quantities, subtotal, and checkout trigger.
- [`src/components/SwipeCard.jsx`](src/components/SwipeCard.jsx): Card component handling swipe physics, stamps, and expandable specs sheet.

---

## 6. Development & Build Rules
- **Suspense Boundary**: Client components using dynamic route params or search params (`useParams()`, `useSearchParams()`) must be wrapped in `<Suspense>` to ensure clean Next.js static prerendering.
- **Local Persistence**: Any modification to products, settings, or orders must update both the reactive context state and browser `localStorage`.
- **Formatting**: Prices are formatted in Bangladeshi Taka (`৳`), and dates are rendered in Bengali locale (`bn-BD`).
