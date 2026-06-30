
# Silah Logistics — Website

A production-quality, **front-end-only** marketing + quick-quote website for
**Silah Logistics**, a B2B digital freight marketplace ("Connect, Quote, Ship").
Built as a **pure vanilla static site** — plain HTML, CSS, and JavaScript with
**zero build step and zero dependencies**. All data is mocked — there is no
backend, authentication, or payments.

## ✨ Features

- **Fully responsive** — desktop and mobile. The left sidebar collapses into an
  off-canvas hamburger drawer on small screens; the navbar adapts.
- **Bilingual EN / AR with full RTL** — a language toggle in the navbar switches all
  copy and flips the entire layout direction (`<html dir>` / `lang`), mirroring the
  sidebar to the right in Arabic. Choice is persisted to `localStorage`
  (`silah.lang`) and applied before first paint to avoid a flash.
- **Animations (native)** — CSS transitions for hovers/press; a vanilla
  `IntersectionObserver` powers scroll-reveal for sections and the animated
  count-up stats (locale-aware digits). Respects `prefers-reduced-motion`.
- **Navbar + collapsible sidebar** — logo, language toggle, and Register in the
  navbar; Quick Quote (Get Quote), Services, About, and Legal (Privacy Policy /
  Terms of Use) in the sidebar, with a red start-side accent bar on the active route.
- **Quick Quote wizard** — a 3-step wizard (numbered stepper: gray → navy active →
  green completed) with searchable seaport comboboxes (keyboard accessible),
  cargo-type cards, cargo details, validation, and a mocked quote result. Runs in
  "Demo mode" — no data leaves the browser.

## 🧱 Tech Stack

| Concern   | Choice                                               |
| --------- | ---------------------------------------------------- |
| Markup    | Static HTML5 (one file per page)                     |
| Styling   | Hand-written CSS with CSS-variable design tokens     |
| Behavior  | Vanilla JS (ES5-compatible, no framework, no build)  |
| Animation | CSS transitions + `IntersectionObserver`             |
| i18n      | Custom JS dictionary (EN / AR) + full RTL            |
| Icons     | Inline SVG set (`js/icons.js`), lucide-style         |
| Fonts     | Inter (LTR) + Noto Kufi Arabic (RTL) via Google Fonts |

## 🚀 Getting Started

There is **no build step**. Because the pages load JS modules with relative
paths, serve the folder over HTTP (opening via `file://` also works in most
browsers, but a server is recommended):

```bash
# Python (any 3.x)
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000/>.

## 🗺️ Pages

| File                 | Page                                              |
| -------------------- | ------------------------------------------------- |
| `index.html`         | Home (hero video, stats, about, why-choose, etc.) |
| `how-it-works.html`  | Services / How Silah Logistics Works              |
| `about.html`         | About Silah Logistics (bilingual EN/AR)           |
| `privacy.html`       | Privacy Policy (English-only legal page)          |
| `terms.html`         | Terms of Use (English-only legal page)            |
| `quote-start.html`   | Quick Quote intro                                 |
| `quote-wizard.html`  | 3-step Quick Quote wizard                         |
| `register.html`      | Create Account (placeholder)                      |

View Rates, Careers, Contact, and Cookie Policy remain intentionally
**non-functional stub links** (they show a "coming soon" toast).

## 📁 Project Structure

```
.
├── index.html              # Home
├── how-it-works.html       # Services / How it works
├── about.html              # About (bilingual)
├── privacy.html            # Privacy Policy (English-only legal page)
├── terms.html              # Terms of Use (English-only legal page)
├── quote-start.html        # Quick Quote intro
├── quote-wizard.html       # 3-step wizard
├── register.html           # Create Account placeholder
├── css/
│   └── styles.css          # Design tokens + all component styles + RTL + responsive
├── js/
│   ├── icons.js            # Inline SVG icon set + renderer
│   ├── i18n.js             # EN/AR dictionaries + translation engine + dir handling
│   ├── data.js             # Static seaport dataset + searchPorts()
│   ├── layout.js           # Injects shared navbar / sidebar / footer
│   ├── main.js             # Bootstrap: menu, lang toggle, reveal + count-up, toasts
│   └── wizard.js           # 3-step Quick Quote wizard logic
└── assets/                 # logo, wordmark, symbol, favicon, backgrounds, intro video
```

Each HTML page contains only its own main content; the navbar, sidebar, and
footer are injected by `js/layout.js` so the chrome stays identical and DRY.

## 🌍 Adding / editing copy & languages

All UI strings live in the `TRANSLATIONS` object in `js/i18n.js` (`en` and `ar`).
Markup references them via attributes:

- `data-i18n="key"` → element text
- `data-i18n-ph="key"` → `placeholder`
- `data-i18n-aria="key"` → `aria-label`

To add a language, add another top-level block to `TRANSLATIONS`, add its code to
`SUPPORTED` (and to `RTL` if it is a right-to-left language), and extend the
toggle logic.

## 🔌 Swapping the seaport dataset for a real API

Seaport search is backed by a local static dataset in `js/data.js` behind
`SilahData.searchPorts(query)`. To use a live ports API later, replace the
implementation of that function — the combobox UI does not need to change.

## 📝 Notes / Out of scope

- No real authentication, payments, or network calls — everything is mocked.
- The quote wizard runs in **Demo mode** and returns illustrative figures only.
