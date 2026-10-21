# EventEase — Smart College Event Management Platform

> **Final Engineering Capstone Project**  
> A full-stack, production-style, responsive web application for college events, hackathons, and technical symposiums featuring an **Isolated Dynamic Event Theme Engine**, dynamic team registrations, manual UPI QR payment verification, optical attendance scanning, and automated verifiable certificate generation.

---

## 📸 Reference Design & Key Screens

The design strictly follows the institutional specifications:
- **Main EventEase Website**: Retains a consistent, clean white and warm off-white design with emerald green accents (`#059669`), charcoal typography (`#0f172a`), subtle borders, and rounded cards.
- **Dynamic Event Theme Engine**: When viewing an individual event (e.g., **IT Branch Hackathon — Harry Potter**, **AML Branch Hackathon — Subway Suppers**, **CS Branch Hackathon — Tech Innovation**, or **Mechanical Fest — Pushpa Wildfire**), only that event's landing page, registration form, tickets, and certificates adopt the organizer's theme. The global navigation and main site remain completely unpolluted!

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)**, **React 19**, **TypeScript** (Strict typing) |
| **Styling & Design** | **Tailwind CSS**, Lucide Icons, Glassmorphic ambient overlays |
| **State & Persistence** | **Dual-Mode Architecture**: Persistent browser/client state out-of-the-box + **Supabase PostgreSQL & Auth** |
| **Analytics & Charts** | **Recharts** (Bar charts, Donut charts, turnout metrics) |
| **QR Code Generation** | `qrcode` (High-definition dynamic QR generation for UPI, tickets, and certificate verification) |
| **Certificate PDFs** | `jspdf` (Landscape vector rendering with custom borders, theme colors, and QR stubs) |
| **Bulk ZIP Export** | `jszip` (Bulk packaging of event certificates into downloadable ZIP archives) |
| **Interactive UX** | `canvas-confetti` (Registration and winner confirmation celebrations) |

---

## 🌟 Core System Modules

### 1. Dynamic Event Theme Engine (Isolated Scoping)
- **Automatic Image Color Extraction**: Organizers can upload **ANY photo** (e.g. *Pushpa* red sandalwood forest, *Harry Potter* Hogwarts castle, *Subway Suppers* sandwich, or cyber tech).
- **Pixel Sampling Canvas**: A lightweight canvas-based sampler extracts the dominant hue, calculates complementary glows, deep background contrasts (`#0A0D17`, `#064E3B`, `#180B09`), and high-contrast text.
- **Dedicated Theme Studio** (`/organizer/events/[eventId]/theme`): Real-time live preview toggling between the Event Landing Page, Registration Form, and Certificate.

### 2. Configurable Dynamic Team Registration
- **Organizer Limits**: Organizers configure `minTeamSize` and `maxTeamSize` (e.g. 2 to 4 members).
- **Adaptive Form Generation**: Form dynamically expands and contracts member fields based on selected team size.
- **Validation**: Enforces unique emails among team members, rolls numbers/USN, and team uniqueness.

### 3. QR-Based UPI Event Payment System
- **Fee Calculation**: Automatically computes total fee based on `per_team` or `per_person` rule.
- **UPI QR Display**: Renders the organizer's official UPI QR code with Payee name and UPI ID.
- **Student Submission**: Students submit their 12-digit UPI UTR number and payment screenshot proof.
- **Organizer Verification Queue**: Organizers review proofs with 1-click **Verify & Activate Ticket** or **Reject with Reason**.

### 4. QR Tickets & Optical Attendance Check-In
- **Opaque Ticket Tokens**: Generates tamper-resistant ticket identifiers (e.g. `TKT-IT-84920-R1`).
- **Venue Scanner Console** (`/organizer/events/[eventId]/attendance`): Includes camera scanning simulation + manual code lookup fallback.
- **Duplicate Prevention**: Rejects duplicate scans with exact timestamp and previous reviewer attribution.
- **Cross-Event Rejection**: Prevents tickets from other hackathons from checking in.

### 5. Automated Verifiable Certificate Generation
- **Participation Certificates**: Automatically qualified based on verified attendance records.
- **Winner Certificates**: Organizers select 1st, 2nd, and 3rd place teams. Certificates are generated for **each member of every winning team**!
- **Theme-Based Styling**: Each certificate adopts the event's colors, background, and fonts.
- **Public Verification Portal** (`/verify-certificate`): Anyone can scan the certificate QR or enter the certificate number to verify institutional authenticity.

---

## 👥 Demo Personas (1-Click Switcher Available in Top Bar)

| Role | Name | Email | Focus Area |
|---|---|---|---|
| 🎓 **Student** | **Riya Sharma** | `riya.sharma@college.edu` | Registered for IT Hackathon (Team ByteBites), CS Hackathon, tickets, certificates |
| 🏛️ **Organizer** | **Prof. Ananya Roy** | `ananya.roy@college.edu` | IT Branch Council Lead; manages events, theme studio, payment reviews, attendance |
| 🛡️ **Super Admin** | **Dr. Rajesh Verma** | `admin@eventease.college.edu` | Dean of Student Affairs; branches governance, platform analytics, audit trail |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm test
```
Executes the 20-point compliance test suite verifying all business logic workflows.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Database & Supabase Schema

The project includes production-ready PostgreSQL migrations in `supabase/migrations/20261020_init_eventease.sql` with full Row Level Security (RLS) policies:
- `profiles`
- `branches`
- `events`
- `event_themes`
- `event_registration_settings`
- `event_payment_settings`
- `registrations` & `team_members`
- `payment_submissions`
- `tickets`
- `attendance_records`
- `event_results`
- `certificates`
- `notifications`
- `audit_logs`

To connect to a live Supabase project, copy `.env.example` to `.env.local` and add your project URL and keys.

---

## 📜 Academic Integrity & Capstone Notes
This project was developed for a second-year engineering capstone project. All database operations, theme rendering, PDF generation, and security checks are functional.
