# Eventify — AI-First Virtual Event & Community Platform

Eventify is a modern, high-fidelity MERN-stack event management and social community platform. Featuring glassmorphic dark obsidian UI styling, a custom Socket.IO real-time chat lounge, Reddit-style forums, secure Razorpay checkout verification, and AI-driven event timelines powered by stable Google Gemini integrations.

---

## 🚀 Key Modules & Capabilities

### 1. AI Co-Creator Workspace
* **Natural Language Event Drafting**: Uses stable `gemini-1.5-flash` structure extractors to construct complete event descriptions, categories, languages, and pricing details from casual chat descriptions.
* **Timeline Optimizer**: A ReAct-based bot resolving timeline slot conflicts and sequencing sessions sequentially.
* **Operations Analyst**: Aggregates registration metrics, attendee counts, and revenue statistics into professional Markdown insights.

### 2. Community Lounges & Clubs
* **15 Seeded Categories Clubs**: Includes AI & ML, Web Dev, Mobile apps, CP, Cyber Security, Cloud, Web3, Data Science, UI/UX, Startups, Open Source, Career Placements, Photography, Gaming, and General Discussion.
* **Lounge Chat (Socket.IO)**: Features real-time messaging, user typing indicators, current online member list broadcasts, message pinning, and reaction popovers (👍, ❤️, 🔥, 👏, 😂).
* **Discussion Board**: Reddit-style forum sorted by Newest or Popular, support for pinning/locking threads, and recursive comments mapping.
* **Shared Library Directory**: Section allowing documents upload (PDF, PPT, ZIP) or links sharing.
* **Leaderboards**: Dynamically ranks users based on participation activity scores (10 pts per post, 5 pts per comment reply).

### 3. Booking & Razorpay Payment Verification
* **Registrations**: Enforces booking logic preventing duplicate bookings. Bypasses transaction prompts automatically for free events.
* **Test Checkout Integration**: Connects with Razorpay Sandbox. Updates booking collections with payment signatures upon verification.
* **Secure Meeting Access**: Meeting endpoints check for `bookingStatus = CONFIRMED` and `paymentStatus = PAID` before initializing Jitsi Meet workspace frames.

### 4. Platform Admin Dashboard
* **Separate Auth Portal**: Administrative routes are protected using separate role-based checks and admin login flows.
* **User Accounts Directory**: Complete overview of users with Block, Unblock, and Delete actions.
* **Immediate Block Invalidation**: Blocking an account immediately deactivates the user, clears session cookies on the server, and triggers a redirection to the sign-in page.
* **Clubs Console**: Portal to configure rules, categories, descriptions, banners, and logos.
* **System-wide Announcements**: Panel to publish announcements that propagate into active notifications for all users.

---

## 🛠️ Architecture & Technologies

* **Frontend**: React (v19), React Router DOM (v7), Tailwind CSS (v3), Axios, Lucide React icons, and Toastify notifications.
* **Backend**: Node.js, Express, Socket.IO (v4), Mongoose (v8), and Passport.js (Google OAuth).
* **Database**: MongoDB (Atlas).
* **AI Model Engine**: Google Generative AI SDK (`gemini-1.5-flash`, `gemini-1.5-pro`).
* **Payment Processor**: Razorpay SDK.

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # DB and database seeding configurations
│   │   ├── features/           # Modular features (auth, community, bookings, payments, etc.)
│   │   ├── middleware/         # isAdmin, isBlocked, and auth validators
│   │   ├── models/             # Mongoose schemas (Club, Post, Comment, User, Booking, etc.)
│   │   ├── services/           # Stable Gemini AI services wrappers
│   │   └── app.js & server.js  # Server listener and Socket.IO initialization
│   └── package.json
└── virtual-event-platform/
    ├── public/
    ├── src/
    │   ├── components/         # Layout wraps, Sidebar, Protected routes
    │   ├── pages/              # ClubHome, AdminDashboard, Community page tabs, Login
    │   ├── index.css           # Glowing obsidian color grading and gradients CSS
    │   └── App.js              # Routing and Axios interceptors
    └── package.json
```

---

## 🔧 Installation & Startup

### Step 1: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_google_ai_studio_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Step 2: Install Dependencies
Install all package dependencies in both directories:
```bash
# Install backend modules
cd backend
npm install

# Install frontend modules
cd ../virtual-event-platform
npm install
```

### Step 3: Run the Application
Start the development servers:

**Backend Server:**
```bash
cd backend
npm run dev
```
*(On startup, the seeder automatically checks and registers the platform admin account `admin@admin.com` / `admin` and populates the 15 clubs).*

**Frontend Client:**
```bash
cd virtual-event-platform
npm start
```
Go to `http://localhost:3000` to view the platform!
