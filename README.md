# 🌾 Kisan Seva — Farmer-to-Buyer Marketplace

**Kisan Seva** is a modern, bilingual digital marketplace that connects Indian farmers directly with buyers — eliminating middlemen, ensuring fair prices for farmers, and giving buyers access to fresh produce straight from the source.

---

## 📖 About the Project

Indian farmers often lose a significant share of their earnings to intermediaries. **Kisan Seva** solves this by providing a direct, trust-based platform where:

- **Farmers** can list their crops, set their own prices, and manage orders.
- **Buyers** can browse fresh produce, place orders, and track their purchase history.
- **Real-time updates** keep both sides informed instantly when an order is placed.

The platform is designed to be **simple, mobile-first, and accessible** — even for users with limited digital literacy — with full support for English and Hindi.

---

## ✨ Key Features

### 👨‍🌾 For Farmers
- **Crop Listing**: Post crops with images, price, quantity, and description.
- **Seller Dashboard**: View total earnings, active listings, and order analytics.
- **Real-time Orders**: New orders appear instantly on the dashboard via Supabase Realtime.
- **Inventory Management**: Edit, update, or remove listings anytime.

### 🛒 For Buyers
- **Marketplace Browsing**: Explore fresh produce from verified farmers.
- **Cart & Checkout**: Add multiple items, review, and place orders smoothly.
- **Order Confirmation Animation**: Delightful success animation after placing an order.
- **Buyer Dashboard**: View total spendings and complete order history.

### 🔐 Authentication & Security
- **Mobile + Password Login** — no email required, designed for Indian users.
- **Google OAuth** as a quick alternative.
- **Row-Level Security (RLS)** ensures users only access their own data.
- **Role-Based Access** (Buyer / Farmer) with secure server-side validation.

### 🎨 UX & Design
- **Bilingual (English + Hindi)** powered by i18next.
- **Dark / Light Mode** with theme persistence.
- **Smooth Animations** using Framer Motion.
- **Responsive Design** — works beautifully on phones, tablets, and desktops.
- **Login-Gated Dashboard** — guests see a friendly prompt instead of empty data.

---

## 🏗️ Architecture Diagram

The diagram below shows the full stack — frontend, backend, database, and the data flow between farmers and buyers.

📄 **[View Architecture Diagram →](/architecture)**

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18 + Vite 5 + TypeScript |
| **Styling** | Tailwind CSS v3 + shadcn/ui |
| **Animations** | Framer Motion |
| **Routing** | React Router v6 |
| **State Management** | React Context + TanStack Query |
| **Internationalization** | i18next (English + Hindi) |
| **Backend (BaaS)** | Lovable Cloud (Supabase) |
| **Database** | PostgreSQL with Row-Level Security |
| **Authentication** | Supabase Auth (Phone + Password, Google OAuth) |
| **Realtime** | Supabase Realtime (Postgres Changes) |
| **File Storage** | Supabase Storage (crop images) |
| **Forms & Validation** | React Hook Form + Zod |

---

## 🔄 How It Works (Brief Workflow)

1. **Farmer signs up** with mobile + password and posts a crop listing (image + price + quantity).
2. **Buyer browses** the marketplace, adds items to cart, and proceeds to checkout.
3. **Order is placed** → stored in `orders` and `order_items` tables with proper RLS.
4. **Success animation** plays for the buyer confirming the order.
5. **Realtime sync** instantly updates the farmer's dashboard with the new order.
6. **Both dashboards** reflect updated stats — earnings for the farmer, spendings for the buyer.

---

## 📂 Project Structure

```
src/
├── components/      → Reusable UI components (Navbar, Footer, Layout, etc.)
├── pages/           → Route-level pages (Index, Marketplace, Checkout, Dashboard, Auth)
├── providers/       → Auth, Cart, Theme context providers
├── integrations/    → Supabase client + auto-generated types
├── i18n/            → English + Hindi translations
├── hooks/           → Custom React hooks
└── lib/             → Utilities

supabase/
├── migrations/      → SQL migrations (tables, RLS policies, functions)
└── config.toml      → Backend configuration
```

---

## 🚀 Getting Started

This project runs entirely on **Lovable Cloud** — no local Supabase setup needed.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 💡 Future Enhancements

- 🚚 Delivery tracking & logistics integration
- 💳 Online payments (UPI, cards) via Razorpay/Stripe
- ⭐ Rating & review system
- 📊 AI-powered price recommendations for farmers
- 🌦️ Weather-based crop advisory

---

**Built with ❤️ for Indian farmers.**
