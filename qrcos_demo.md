# Demo QRCOS (QR Code Ordering System) Specification

A modern, multi-tenant QR code ordering platform with Next.js, Tailwind CSS, MongoDB, Telegram notifications, and Cloudinary media management.

## 1. Tech Stack
- **Framework**: Next.js (App Router, React, TypeScript)
- **Styling**: Tailwind CSS with rich modern UI, dark/light theme accents, and micro-interactions
- **Database**: MongoDB with Mongoose ORM
- **Telegram Bot**: Telegram Bot API / Neogram webhook for real-time kitchen receipts and interactive order status buttons
- **Media**: Cloudinary integration with base64 / local upload fallback
- **Security**: Bcrypt password hashing + JWT tokens stored in localStorage / cookies

---

## 2. Database Schema

### 2.1 Admins (`admins`)
- `_id`: ObjectId
- `email`: String (required, unique, lowercase)
- `password`: String | null (nullable: if null, initial login prompts the admin to set new password; otherwise verifies existing password)
- `status`: String (`active` | `inactive`, default: `active`)
- `createdAt`: Date
- `updatedAt`: Date

### 2.2 Restaurants (`restaurants`)
- `_id`: ObjectId
- `name`: String (required)
- `slug`: String (required, unique, lowercase URL identifier)
- `password`: String | null (nullable: if null, owner prompts to set password on first login; otherwise checks password)
- `description`: String
- `detail`: Mixed Array, `[{ key: string, value: string }]` (e.g. Phone, Address, WiFi password)
- `logoUrl`: String
- `expiredAt`: Date
- `status`: String (`active` | `inactive` | `suspended`, default: `active`)
- `telegramChat`: String (Telegram channel username or Chat ID e.g. `@post_timir_content`, receives order alerts)
- `config`: Array, `[{ feeName: string, type: 'percent' | 'fixed', amount: number }]` (e.g. `vat`: 15%, `service fee`: $2.00)
- `createdAt`: Date
- `updatedAt`: Date

### 2.3 Menus (`menus`)
- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: `Restaurant`, required, indexed)
- `category`: String (required, indexed)
- `name`: String (required)
- `description`: String
- `price`: Number (required, min: 0)
- `detail`: Mixed Array, `[{ key: string, value: string }]` (e.g. Calories, Spice Level, Allergens)
- `imgUrls`: Array of Strings (image URLs from Cloudinary or media storage)
- `visibility`: String (`public` | `private`, default: `public`)
- `createdAt`: Date
- `updatedAt`: Date

### 2.4 Orders (`orders`)
- `_id`: ObjectId
- `restaurantId`: ObjectId (ref: `Restaurant`, required, indexed)
- `table`: String (table number or label, extracted from `?table=` query parameter)
- `customerName`: String (default: `Guest`)
- `notes`: String
- `details`: Array of items:
  - `menuId`: ObjectId (ref: `Menu`)
  - `name`: String
  - `quantity`: Number (min: 1)
  - `unitPrice`: Number
  - `subtotalPrice`: Number
- `fees`: Array of applied fees:
  - `feeName`: String
  - `type`: String (`percent` | `fixed`)
  - `rate`: Number
  - `calculatedAmount`: Number
- `subtotal`: Number
- `totalPrice`: Number (subtotal + sum of fee amounts)
- `status`: String (`pending` | `preparing` | `completed`, default: `pending`)
- `telegramMessageId`: Number (stored message ID for live editing via Telegram Bot API)
- `orderedAt`: Date (default: `Date.now`)
- `startPreparingAt`: Date (timestamp when status changes to `preparing`)
- `completedAt`: Date (timestamp when status changes to `completed`)
- `createdAt`: Date
- `updatedAt`: Date

---

## 3. Main Application Routes

1. **Landing Page (`/`)**:
   - Showcase and interactive links to Demo Admin, Sample Restaurant Dashboards, Diners Menu, Kitchen Display, and Order History.

2. **Admin Portal (`/admin`)**:
   - Single-page interface with tabbed views & modals.
   - Authentication gate verifying credentials against `Admins` collection.
   - Session token stored in cookies and localStorage with key `qrcos-admin-<token>`.

3. **Restaurant Owner Portal (`/r/[slug]`)**:
   - Authentication gate against `Restaurants` collection matching slug.
   - Session token stored in cookies and localStorage with key `qrcos-restaurant-<token>`.
   - Cannot modify `expiredAt` or `status` (reserved for Super Admin).

4. **Public Diner Menu (`/m/[slug]`)**:
   - Completely public, zero authentication required.
   - Extracts table number from URL query `?table=12`. Prompts diner to enter table number if missing.
   - Live category navigation, search, modal dish viewer with multiple photos and nutrition/spice details.
   - Interactive cart drawer, order note, instant order submission.
   - Stores placed order ID in diner's `localStorage` (`qrcos_customer_orders`).

5. **Kitchen / Restaurant Order Board (`/o/[slug]`)**:
   - Real-time dispatcher for restaurant kitchen staff & owners.
   - Accessible to platform admins and authorized restaurant owners.
   - Live order columns/filters (Pending, Preparing, Completed) with 1-click status transitions.

6. **Customer Order History (`/my-history`)**:
   - Public page reading customer order history stored in `localStorage`.
   - Polling order status every 1 second (no WebSockets needed) to display live kitchen progress.

---

## 4. Key Functional Capabilities

### 4.1 Admin Capabilities
- **Single Page + Modals**: Zero cumbersome redirects; all actions performed via modals.
- **Dynamic Onboarding / Login**:
  - If unauthenticated, prompts for email.
  - If email exists and `password === null`, renders setup password modal (new password + confirm password).
  - If email has an existing password, verifies password with bcrypt.
- **Change Password**: Modal verifying current password and setting new password.
- **Restaurant Management**:
  - List restaurants with dual view modes: Table view and Card Grid view.
  - Create, edit, and delete restaurants.
  - View restaurant's live orders.
  - Reset restaurant password: sets `Restaurants.password = null` to allow owner re-onboarding.
- **High-Resolution QR Code Studio**:
  - Input table number to generate link `NEXT_PUBLIC_URL/m/[slug]?table=[number]`.
  - Renders a stylized printable card featuring restaurant name, logo, table badge, scan instructions ("Scan & Order"), and dynamic QR code.
  - One-click high-resolution PNG download with filename: `[restaurantNameOrSlug]_table_[tableNo]_QR_code.png`.

### 4.2 Restaurant Owner Capabilities
- **Authentication**:
  - Access via `/r/[slug]`.
  - If `Restaurants.password === null`, prompts for initial password creation.
  - If password exists, verifies password.
- **Profile Management**: Update name, description, logo, contact details, fee configurations (cannot change `expiredAt` or `status`).
- **Change Password**: Modal verifying current password and setting new password.
- **Menu Management**:
  - Full CRUD for menu items.
  - Manage categories, descriptions, price, item details (key/value), and image uploads via Cloudinary.
  - Toggle item visibility (`public` / `private`).
- **QR Code Studio**: Generate and download printable table QR codes identical to admin generator.
- **Live Kitchen Orders**: Real-time order tracking and status switcher.

### 4.3 Diner & Menu Capabilities
- Public access without login.
- Respects `?table=[tableNo]` from QR scan; prompts diner if table parameter is omitted.
- Responsive, mobile-first design with smooth category scrolling and item search.
- Dish detail modal with full image gallery and dietary attributes.
- Live checkout computing item subtotal and restaurant fees (e.g. VAT, service fee).
- Dispatches order to MongoDB and fires Telegram notification with interactive inline buttons.
- Real-time status badge that updates automatically via 1-second background polling.

### 4.4 Telegram Kitchen Bot Integration
- Automatically posts formatted receipt to restaurant's configured Telegram chat when order is placed.
- Formatted receipt includes table number, customer name, order line items, subtotal, fees, total price, and customer notes.
- Inline keyboard buttons: `[ ⏳ Pending ]`, `[ 👨‍🍳 Preparing ]`, `[ ✅ Completed ]`.
- Webhook endpoint (`/api/telegram/webhook`) listens for `callback_query`, verifies secret header, updates MongoDB order status (`startPreparingAt` / `completedAt`), and refreshes the Telegram message inline buttons with checkmarks.
- Frontend status polls every 1 second against `/api/orders/[id]` to seamlessly reflect updates made inside Telegram.
