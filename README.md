# ♻️ Front-end: NoThrowam

**WasteHack 2026 - User Interface & Seller Dashboard**

This is the official Front-end repository for **NoThrowam**, developed for the **WasteHack 2026**. This interface empowers users to easily evaluate their waste using Artificial Intelligence and manage their recyclable material sales through an interactive dashboard.

---

## Key Features

- **AI Waste Scanner (Drag & Drop):** An interactive component allowing users to upload a photo of their waste. The image is converted to Base64 and sent to our AI backend to determine its category, estimated weight, and market price.
- **Dynamic Seller Dashboard:**
- **Custom SVG Graphs:** Displays revenue trends over the last 6 months, dynamically generated from live API data.

* **StatCards:** Real-time tracking of total earnings, total weight recycled, and the number of listings.

- **Secure Authentication:** JWT token integration to securely handle API calls to our backend.
- **Responsive & Modern Design:** A smooth and intuitive interface built with Tailwind CSS, optimized for both web and mobile experiences.

---

## Technologies Used

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite (for lightning-fast development and hot-module replacement)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Requests:** Native Fetch API (with custom headers for security and ngrok bypass during development)

---

## Local Installation & Setup

### Prerequisites

Ensure you have **Node.js** (version 16+ recommended) and **npm** (or yarn/pnpm) installed on your machine.

### Steps

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Hking/frontend-wastehack.git](https://github.com/Hking107/NoThrowam-Frontend)
   cd NoThrowam-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the Vite development server:**

   ```bash
   npm run dev
   ```

4. **Open the application:** Navigate to `http://localhost:5173` in your web browser.

---

## Key Code Structure

- `src/components/WasteScannerModal.tsx`: The AI scanning module with Drag & Drop handling and a 3-step API flow (Create post -> AI Analysis -> UI Update).
- `src/pages/SellerDashboard.tsx`: The main dashboard containing the math for the dynamic SVG graph and stats aggregation.
- `src/components/MyListings.tsx`: A reusable component used to display Waste owner sales to recyclers

---

_Made with Love for the planet during WasteHack 2026._
