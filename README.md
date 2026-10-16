# 🌍 TravelTales — Premium Travel & Skip-The-Line Attraction Booking Platform

A high-performance modern travel booking and itinerary platform built with **Vanilla HTML5, CSS3, JavaScript (ES Modules)**, **GSAP 3 animations**, **Leaflet Interactive Maps**, **Canvas Confetti**, and a **Firebase-ready architecture**.

Inspired by modern fintech & travel dashboard aesthetics (soft neutrals, rounded containers, glowing emerald `#00C07F` accents) and engineered to implement every feature from the reference designs and handwritten notebook specifications.

---

## 🚀 Key Features Implemented

### 1. 🎨 Visual Design & Dashboard (Exact Mockup Match)
- **Left Sidebar**:
  - Logo with glowing emerald badge
  - Navigation tabs: `Dashboard` (active green pill), `Discover`, `Tickets` (dynamic count), `Favorite`, `Trip Planner`, `Messages` (unread badge `5`), `Transaction`
  - **50% Discount Promotional Card** with direct call to action
  - Settings & Firebase Quick Setup trigger
  - Authentication status (Log In / Log Out)
- **Top Bar**:
  - Destination search bar with filter button and search action
  - Notifications & Messages triggers
  - User avatar with status indicator
- **Cascading Mega-Menu ("Explore Cities & Wonders")**:
  - Hovering over "Explore Cities & Wonders" opens the cascading menu
  - Hovering over any city (`Agra`, `Mathura`, `Vrindavan`, `Jaipur`, `Switzerland`) reveals a sub-sub menu of top attractions with thumbnail previews and starting prices
  - Clicking any attraction instantly opens its comprehensive detail modal!
- **Center Hero Card**:
  - **Embedded 4K Attraction Video Loop** with Play/Pause, Sound Mute/Unmute, and Live Stream indicator
  - Toggle between **Live Video** and **Photo Gallery**
  - Interactive thumbnail strip (`+25` preview badge)
  - Detail badges: `⏱ 120 hours`, `🌙 5 night`, `🌿 Only Nature`
  - Price display and "Book Travel" / Skip-the-line action button
- **Popular Places Grid**:
  - Cards matching the reference image (`Moraine Lake`, `Mount Forest`, `Osert Zalvice Lake`, `Taj Mahal`, `Prem Mandir`, `Amber Fort`, etc.)
  - Category tags, ratings, and instant wishlist heart toggling
  - **GSAP 3 Animations**: Smooth card entrance stagger and hover tilt micro-interactions
  - **Skeleton Loading State**: Shimmer loading placeholders on initial load and via the "Simulate Loading" toggle
- **Right Panel**:
  - Interactive **Calendar Widget** (`May 2024` with month navigation and `Wed 18` active day pill)
  - **My Schedule** list (`Crook Forest`, `Gioc Waterfall`, `Tartaruga Camp`, `Taj Mahal Sunrise`) with attendee avatars
  - Quick access buttons to Smart Journey Planner tools

---

### 2. 🏛️ Attraction Detail Modal & External Map
Clicking any attraction card or menu item opens a rich modal containing:
- **Opening Hours**: Regular hours, closed days (e.g., *Taj Mahal closed on Fridays*), and night view hours
- **Ticket Pricing & Skip-the-Line Tiers**: General entry, Foreign tourist, VIP priority passes
- **Visitor Requirements**: ID rules, shoe covers, photography rules, dress code
- **Interactive External Map Integration**:
  - Live **Leaflet OpenStreetMap** showing exact coordinates and pin
  - Direct link to **Google Maps & Directions**
- **Skip-the-Line Instant Booking CTA**

---

### 3. 🎟️ Skip-The-Line Booking & Payment Simulation
- Multi-step modal checkout:
  1. Select ticket tier, visit date, entry time slot, and guest counts (Adults & Children)
  2. Select payment method: **UPI / Google Pay**, **Credit/Debit Card**, or **NetBanking**
  3. Real-time total price calculation
  4. Authorize payment with simulated gateway verification
  5. **Celebratory Confetti Explosion** (`canvas-confetti`) upon payment confirmation
  6. **Printable / Downloadable Ticket Voucher** with custom QR code, booking reference number, and instructions

---

### 4. 👤 User Authentication & Profile Page
- **Authentication**:
  - Sign in via **Gmail / Google** (1-click simulation)
  - Sign in via **Phone Number + Password / OTP**
  - Sign in via **Email + Password**
  - Account registration with name, email, phone, and avatar
- **User Profile Management**:
  - Change photo by selecting from 8 preset traveler avatars or entering a custom image URL
  - Edit Name, Phone, Email, Bio, and Home City
  - **Planned Trips Tab**: View and manage upcoming trips, add new journeys, and open the presentation view
  - **Favorites & Wishlist Tab**: Saved destinations with instant booking access
  - **Active Tickets Tab**: View all booked passes with QR codes

---

### 5. 🧮 Trip Planner Suite (Handwritten Notebook Specifications)
- **1. Budget-Sharing Calculator**:
  - Add group travel expenses (lodging, transport, food, activities)
  - Specify who paid and who splits each item
  - Automatically calculates total spent, individual fair shares, and net settlement balances (who owes whom)
- **2. Itinerary Conflict Checker**:
  - Checks for monument closures (e.g., Taj Mahal on Fridays)
  - Checks for unrealistic transit time buffers between distant cities
  - Provides 1-click auto-reschedule suggestions!
- **3. Family-Friendly Trip Planner**:
  - Tailors destinations based on traveling with kids, seniors (wheelchair access), and preferred trip pace
  - Includes famous local food specialties (e.g., *Agra Petha, Mathura Peda, Jaipur Dal Baati Churma, Swiss Fondue*)
- **4. Trip Presentation View**:
  - Fullscreen slideshow mode for completed trips
  - Slide progression with destination cover, daily itinerary timeline, financial summary, and group stats

---

### 6. 🔥 Firebase Cloud Ready
All data operations (`users`, `attractions`, `trips`, `bookings`, `favorites`, `budget`) are handled through `storageService.js` using a schema that mirrors Firebase Firestore.
- Access the **Firebase Setup** modal from the sidebar
- Enter your live `firebaseConfig` object whenever you are ready to connect
- Click **Export Data JSON** to download all local data in a Firestore-ready structure!

---

## 🛠️ Running the Application Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`

3. **Build for Production**:
   ```bash
   npm run build
   ```
