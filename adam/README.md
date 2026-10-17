# ADAM Support Chat — static-site integration

Self-contained ADAM support chat, wired into **every page** of the Silah Logistics
static site as a floating live-chat widget (Intercom / Crisp / Zendesk style).

## Files
| File | Purpose |
|------|---------|
| `ADAM-client.html` | The support chat itself (departments, send/receive, polling, uploads, session persistence, End Session → new session). Loaded inside an iframe by the launcher. Uses relative asset paths, so it must stay under `adam/`. See **`site_id`** and **Delivery** below. |
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

## `site_id`
`v0/send` and `v1/upload-attachment` carry `site_id`, the identifier ADAM uses to attribute a
conversation to the site it came from. It lives in **one** constant, `SITE_ID = 'silah'`, in the
CONFIG block of `ADAM-client.html` — the same value the Silah app (`app.silahlogistics.com`)
sends from its `/adam/adam.config.js`. Only the client document makes ADAM requests here (the
launcher makes none), so no separate config file is needed.

⛔ Without `site_id` the send webhook still answers **HTTP 200 — with an empty body** — and
silently drops the message: nothing is stored and no AI reply is generated (the 2026-10
production incident). Do not change the value or add another one without the ADAM backend owner.

`v0/fetch` and `v1/close-session` were verified to behave identically with and without
`site_id`, so they are left as they were.

## Delivery
A send counts as delivered only on a 2xx **with a non-empty body** (the backend answers
`{"status":"ok"}`). An empty body, an error status or a network failure stops the typing
indicator and marks the bubble **Not delivered · Retry**. Retry resends the *same*
`message_id`, so it never adds a second bubble; a later poll that returns the message clears the
mark. HTTP 403 still ends the session.

## Tests
`node --test` from the repo root runs `tests/adam-client.test.mjs` (zero dependencies). It runs
the client's real inline script against a fake DOM and a scripted `fetch`, pinning the
`site_id` contract and the delivery handling above.

## End Session
The **End Session** button (in the ADAM client header, inside the iframe) closes the current
session on the backend, stops the poll loop, generates a brand-new session id, resets all
chat state and the intake form, and returns to the welcome screen — no page reload
(`startNewSession()` in `ADAM-client.html`).
