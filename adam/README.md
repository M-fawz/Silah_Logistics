# ADAM Support Chat — static-site integration

Self-contained ADAM support chat, wired into **every page** of the Silah Logistics
static site as a floating live-chat widget (Intercom / Crisp / Zendesk style).

## Files
| File | Purpose |
|------|---------|
| `ADAM-client.html` | The support chat itself. **Unchanged backend wiring** (departments, send/receive, polling, uploads, session persistence, End Session → new session). Loaded inside an iframe by the launcher. Uses relative asset paths, so it must stay under `adam/`. |
| `launcher.js` | The floating widget. Injected **once** on every page by `js/layout.js` (`mountAdamLauncher`). Renders the bottom-corner launcher button and, on click, opens `ADAM-client.html` **inline** inside a floating panel — it does **not** open a popup window or navigate away. |
| `assets/adam-logo.png` | Colored ADAM logo — used inside the chat (header, avatars, intake card). |
| `assets/adam-logo-white.png` | White ADAM logo — the orange launcher button + panel title bar. |

## How it mounts
`js/layout.js → render()` calls `mountAdamLauncher()`, which appends
`<script src="adam/launcher.js" defer>` once. Because every page loads `js/layout.js`
and `js/main.js` calls `Layout.render()`, the widget appears site-wide without editing
each HTML file. The launcher guards against double-injection (`window.__adamLauncherMounted`
+ the `#adam-launcher-js` id check).

## The widget
- **Launcher FAB** — fixed bottom corner, ADAM logo, idle bob + hover/press animation.
  Morphs to a minimize (chevron) icon while open. Mirrors to the **left** in Arabic (RTL)
  and re-mirrors live on the site's `silah:langchange` event.
- **Panel** — a floating card with a slim navy Silah title bar ("Live Support · Online" +
  minimize button) above the ADAM iframe. Desktop = floating panel; mobile (≤560px) =
  full-screen, and the FAB is hidden while open so it never covers the message input.
- **Open/close** — via the FAB or the title-bar button; `Esc` also closes. The iframe is
  **lazy-loaded on first open and then kept alive** (only hidden), so polling, unread
  state and the active session all survive close/reopen.

## Sessions
- Same-origin iframe → shares `localStorage` with the host page.
- The active session id lives in `localStorage['adam_active_session']`; the launcher passes
  it as `?session=…` on first open, and the client falls back to that key — so **reloads and
  page-to-page navigation resume the same session** (profile + history refetched).
- Per-session profile is stored under `adam_client_profile_<sessionId>`.

## Backend
n8n webhooks at `https://srv395355.hstgr.cloud/webhook/adam/...`
(`v0/send`, `v0/fetch`, `v1/close-session`, `v1/upload-attachment`,
`v1/download-attachment`, `admin/get-settings`, `admin/list-groups`), all derived from a
single `WEBHOOK_BASE` constant in `ADAM-client.html`.
🔒 **Must stay HTTPS** — the production site is served over HTTPS, so any `http://` (or raw
`IP:port`) endpoint would be blocked as Mixed Content, silently breaking polling, message
fetch, department loading and admin calls.

## End Session
The **End Session** button (in the ADAM client header, inside the iframe) closes the current
session on the backend, stops the poll loop, generates a brand-new session id, resets all
chat state and the intake form, and returns to the welcome screen — no page reload
(`startNewSession()` in `ADAM-client.html`).
