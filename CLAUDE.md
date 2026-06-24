# CLAUDE.md — Silah Logistics Website

## Project
A front-end-only marketing + quick-quote website for **Silah Logistics**, a B2B
digital freight marketplace ("Connect, Quote, Ship"). This is a faithful rebuild
of an existing local prototype. UI only — no real backend; data is mocked.

## Tech Stack (mandatory)
- React 18 + **Vite** + **TypeScript** (strict mode).
- Routing: react-router-dom v6.
- Styling: Tailwind CSS (preferred) with a small design-token layer. PostCSS + autoprefixer.
- Animations: framer-motion (section reveals, hero, card hovers) + a count-up
  hook/lib (e.g. react-countup or a custom IntersectionObserver hook) for stats.
- i18n: react-i18next + i18next, with **English (LTR) and Arabic (RTL)**.
- Icons: lucide-react.
- Forms: react-hook-form (+ zod for validation, optional).
- Install every package you need yourself; keep the dependency list lean.

## Commands
- Dev: `npm run dev` (Vite default port 5173).
- Build: `npm run build`  | Preview: `npm run preview`
- Lint/format: ESLint + Prettier.

## Hard Requirements
1. **Responsive**: must work cleanly on desktop and mobile. Sidebar collapses to a
   drawer/hamburger on mobile; navbar adapts.
2. **i18n EN/AR**: a language toggle in the navbar switches all copy AND flips the
   whole layout direction. AR = `dir="rtl"`, EN = `dir="ltr"` on `<html>`. Mirror
   the sidebar (right side in AR), spacing, and icon directions. Persist choice in
   localStorage.
3. **Animations**: scroll-reveal for sections, animated count-up numbers for stats
   (trigger when in viewport), smooth hover/press states, hero entrance animation.
4. **Navbar + Sidebar**: top navbar (logo, language toggle, Login, Register) and a
   collapsible left sidebar (Quick Quote → Get Quote / View Rates, Carrier Tracking,
   Services, My Quotes). Active route highlighted with a red left-accent bar.
5. **Routes**: `/`, `/how-it-works`, `/quick-quote/start`, `/quick-quote/wizard`.
6. Login/Register/Carrier Tracking/My Quotes/View Rates can be placeholder pages or
   non-functional links — do NOT implement auth. Buttons may route to stubs.

## Brand & Design Tokens
- Primary navy: `#0A2A66` (deep blue). Use darker `#071E4A` for sidebar/footers.
- Accent red: `#E11D2A` (CTAs, active accents, logo link).
- Neutrals: white `#FFFFFF`, light gray section bg `#F5F7FA`, text gray `#4B5563`.
- Badge/pill: soft gold/tan background `#F3E9D2` with brown text for eyebrow labels.
- Headings: bold, heavy display weight, navy. Buttons: rounded-lg, red primary,
  outline secondary.
- Keep a single source of truth for colors in Tailwind config / CSS variables.

## Assets (already provided by the user in the project root / src/assets)
- `logo` — full Silah Logistics logo on **white background** (navbar).
- `logo-wordmark` — "Silah Logistics" wordmark only.
- `logo-symbol` — the chain-link symbol only (favicon / compact navbar / loaders).
- Background images: `unnamed (1)`, `unnamed (4)`,
  `pngtree-containers-in-a-container-port-at-night-in-south-korea-image_13114725`
  — use as section/hero backgrounds with dark overlays for text contrast.
- `intro` video — used as the **hero background video on the home page** (muted,
  autoplay, loop, playsinline, with a poster image fallback).
- The asset source folder on the user's machine:
  `C:\Users\Fawzy\Desktop\Silah_Logistics`. Import them into `src/assets/`.

## Content (use as base copy; create matching Arabic translations)
### Home
- Hero: "Your Global Logistics Connection" — "Silah Logistics is a smart digital
  marketplace that connects you with a trusted network of freight forwarders —
  compare, book, and ship with confidence." CTAs: Get a Quote / Explore Platform.
  Floating pills: 50+ Forwarders, 100+ Countries, 24/7 Support.
- Stats (animated count-up): Active Shippers ~10,000+, Verified Forwarders 500+,
  Countries Served 77+, Uptime 99.9%.
- About: "Built on 20+ years of industry expertise" + ship image.
- Why Choose: 3 cards — Instant Quotes, Real-Time Tracking, 24/7 Support.
- How It Works: 3 steps — Request an RFQ / Compare quotes / Book & ship.
- Global Network band + testimonial (Omar A., Head of Logistics) + final CTA
  ("Ready to streamline your shipments?", Free 3-month trial, Create Free Account).

### How It Works (Services) — /how-it-works
- Eyebrow "Platform Workflow", title "How Silah Logistics Works".
- Core Services: Freight Forwarding, Customs Clearance, Warehousing & Distribution.
- End-to-End Process (4 steps): Create Account → Submit Request → Receive Quotes → Track Execution.
- Why Choose grid (4): Transparent Pricing, Secure Platform, Fast Quotes, Global Network.
- CTA: Create Account / Start Quick Quote.

### Quick Quote Start — /quick-quote/start
- Title "Get Your Shipping Quote", buttons Start Quote Wizard / Create Account,
  benefit checklist, mini stats.

### Quick Quote Wizard — /quick-quote/wizard
- 3-step stepper with numbered circles that turn green when completed.
- Step 1 Shipment Details: Origin + Destination as **searchable comboboxes**
  (autocomplete dropdown; each result shows a name, a port/IATA-style code, and
  country • region). Cargo Type: FCL / LCL / Air Freight / Bulk-Land, shown both as
  a select and as 4 selectable cards.
- Step 2 Cargo Information: Total Weight (kg) number input, Unit Type
  (Boxes/Pallets/Containers), Container Type (20ft Standard, 40ft Standard,
  40ft High Cube, Reefer, Open Top, Flat Rack, ISO Tank), Special Requirements textarea.
- Step 3 Contact & Preferences: Email, Phone, Preferred Shipment Date → "Get Quotes".
- Show a "Demo mode" banner. On submit, show a mocked quote result (no network).
- For the location combobox data, use a local/static JSON dataset of seaports
  (do NOT call external paid APIs). Keep it pluggable so a public API can be added later.

## Code Conventions
- Feature-based folders: `components/`, `pages/`, `layout/`, `hooks/`, `i18n/`,
  `data/`, `assets/`, `styles/`.
- Typed props everywhere; no `any`. Reusable `<Button>`, `<Card>`, `<Section>`,
  `<Stepper>`, `<Combobox>`, `<CountUp>` components.
- Centralize all UI strings in i18n JSON (`en.json` / `ar.json`) — no hardcoded text.
- Accessible: labels, keyboard nav for combobox/stepper, focus states, alt text.

## Out of Scope / Don't
- No real authentication, payments, or backend calls.
- Don't put secrets in the repo. Don't add analytics/trackers.
