# ADAM Chatbot Fix — Main Silah Website

**Date:** 2026-10-17 · **Branch:** `fix/adam-main-site-site-id` · **Fix commit:** `96b3834`
**Status:** **FIX IMPLEMENTED AND TESTED LOCALLY — PRODUCTION DEPLOYMENT PENDING**

---

## 1. Executive summary

On `silahlogistics.com` (and `www.`), visitors could type into the ADAM chat and see their own
message, but nothing else happened: no answer came back and the "typing…" dots eventually just
disappeared. The chat on `app.silahlogistics.com` worked.

The main website runs an older copy of the chat that leaves out one required field,
`site_id`, when it sends a message. The chat server quietly ignores messages without that field.
It still answers "OK" but with an empty reply, so the old chat had no idea anything went wrong.

The chat on the main website now sends `site_id: "silah"`, the same value the working app
uses. A local copy of the corrected site was tested against the real chat server with four
questions; every message was stored and answered by the AI, and the answers appeared in the chat.
The chat now also tells the visitor **"Not delivered · Retry"** if a message is ever not
accepted, instead of leaving them waiting.

**The fix is not live yet.** The corrected file must be uploaded to the Hostinger hosting for
`silahlogistics.com` (see §8).

---

## 2. Root cause

| | Main site (broken) | App (working) |
|---|---|---|
| Client file | `/adam/ADAM-client.html` (51 KB, older fork) | `/adam/ADAM-client.html` (71 KB) + `/adam/adam.config.js` |
| `site_id` in send payload | **absent** | `"site_id": "silah"` |
| Send response | `HTTP 200`, **empty body** | `HTTP 200`, `{"status":"ok"}` |
| Message stored / AI reply | No / No | Yes / Yes |

- The send code in the main-site client (`doSend()` in `adam/ADAM-client.html`) built its JSON
  body from `session_id, sender, message, message_id, group_id, group_name, client_name,
  client_mobile, client_email`. There was no `site_id` anywhere in the main-site code: zero
  matches in the deployed launcher, client, `index.html` or `js/layout.js`.
- The ADAM n8n send webhook does not store a message without an accepted `site_id`. It
  returns `HTTP 200` with a 0-byte body instead of an error.
- The old client never read the send response (it only checked for `403`), so the visitor's
  bubble looked sent and the typing indicator ran for 30 s before silently disappearing.

**Independently reproduced in this session** (§6, test B0). On a fresh synthetic session, the
exact old payload shape returned `200` with a 0-byte body, and a subsequent fetch showed **0**
stored messages. The same session, with only `site_id: "silah"` added (sent by the corrected
UI), returned `{"status":"ok"}`, and the message and AI reply were stored.

---

## 3. Repository and deployment findings

| Question | Finding (verified) |
|---|---|
| Source of truth for `silahlogistics.com` | **This repo**, `github.com/M-fawz/Silah_Logistics` (local: `C:\Users\Fawzy\Desktop\Silah_Logistics`), **not** `ship-hub`. All 17 HTML/JS/CSS files served by `silahlogistics.com` are byte-identical (ignoring CRLF) to `main` @ `c2b77de`, including `/adam/launcher.js` and `/adam/ADAM-client.html`. |
| `www.silahlogistics.com` | Serves the same files as the apex (identical ETag on `/`, identical `/adam/*` bytes). |
| Widget source paths | `adam/ADAM-client.html` (chat client, runs in an iframe), `adam/launcher.js` (floating button + panel), mounted on every page by `js/layout.js → mountAdamLauncher()`. |
| Main-site hosting | Hostinger shared hosting: response headers `Server: LiteSpeed`, `platform: hostinger`, `panel: hpanel`. |
| Main-site deploy mechanism | **Not discoverable from the repo.** It has no CI workflow, deploy script or hosting config. The deployed files have CRLF line endings while Git stores LF, which *suggests* (inference, not verified) they were uploaded from a Windows working copy (hPanel File Manager / FTP) rather than checked out by a Linux Git deploy. |
| `ship-hub` (`github.com/M-fawz/ship-hub`) | The **app** (`app.silahlogistics.com`): React/Vite, deployed by `.github/workflows/deploy-prod.yml` (push to `main` → Hostinger VPS, Docker). Its widget lives in `public/adam/` and is byte-identical to what `app.silahlogistics.com/adam/` serves. Used here only as a **read-only reference**: cloned to a temp folder, nothing changed, committed or pushed. |
| How the app sets `site_id` | `public/adam/adam.config.js` defines `window.ADAM_CONFIG.site_id` (default `'silah'`). Both the launcher (parent page) and the client (iframe) load it, and the launcher forwards it as `?site=`. The client sends it on send, upload, fetch and close-session (`requestIdentity()`). Its README states the contract: *every request carrying session or client data sends `site_id`.* |
| Backend | n8n at `https://srv395355.hstgr.cloud/webhook/adam/…`, shared by both sites. CORS reflects the request origin (verified for `https://silahlogistics.com` and `http://localhost:8000`). The n8n workflows were **not** inspected (no access). |

---

## 4. Changes made

All on branch `fix/adam-main-site-site-id` (from `main` @ `c2b77de`); commit `96b3834`.

### `adam/ADAM-client.html` (the fix)

| Change | Why | From the app? |
|---|---|---|
| New constant `const SITE_ID = 'silah';` in the CONFIG block, next to `WEBHOOK_BASE` | Single source for the site identifier, in the block the README already names as the one place for backend wiring. | Same value as the app's `adam.config.js`. The app needs a separate file because two documents (launcher + iframe) read it. On the main site only the client makes ADAM requests (the launcher makes none and passes no site param), so a constant is the smallest single-source fix. No `adam.config.js` was added. |
| `site_id: SITE_ID` added as the first field of the `v0/send` JSON body. Every existing field is preserved unchanged. | **The root-cause fix.** | Yes (app's `requestIdentity()`). |
| `fd.append('site_id', SITE_ID)` added to the `v1/upload-attachment` FormData | Upload stores a message with the same identity fields, attachments are **enabled** in production (`allow_attachments = 1`), and the app sends `site_id` here. | Yes. **Not exercised end-to-end** (to avoid uploading a file to production); covered by the unit test. |
| Send extracted into `sendText()`. Delivered = `2xx` **and** non-empty body. Empty body, non-2xx or network error → `markSendFailed()`: stop the typing indicator, dim the bubble, and show an inline **"Not delivered. Retry"** row (`role="alert"`). | The empty-200 failure was invisible to the visitor. | Adapted. The app's client only checks `res.ok`, so it would *also* miss an empty-body 200. This is stricter, and still accepts any non-empty 2xx, so the backend's `{"status":"ok"}` (or any other success body) works. |
| Retry calls `sendText()` with the **same** `message_id` and the same bubble | No duplicate bubble. The backend receives the same id. | Same approach as the app. |
| Session guard: results of a send that finishes after **End Session** are ignored | A late failure must not flag the new session. | Same approach as the app. |
| `fetchMessages()`: when a poll returns the visitor's own message, any "Not delivered" mark for that `message_id` is cleared | If a message *was* stored despite a failed response, the visitor isn't prompted to resend. | New. One line in the poll loop; polling logic is otherwise unchanged. |
| `render()` returns the bubble element instead of `true` | So `sendText()` can mark that bubble. Return value was unused elsewhere. | — |
| CSS: `.me.msg-failed .msg`, `.msg-failed-row`, `.msg-retry-btn` (+ `:focus-visible`) | Styling for the failure state, using the existing `--danger` token. | — |
| **Not changed:** `v0/fetch` and `v1/close-session` payloads | Verified live to behave identically with and without `site_id` (§6, B6 and B9). Per the brief, a working flow was not changed for parity. | The app sends `site_id` on these too. Optional follow-up, §9. |

Compatibility: no new files are loaded by the page, no endpoint/URL changes, still HTTPS-only,
same `localStorage` keys, so existing visitors' sessions resume. The failure strings are
English, matching the rest of the ADAM client (which is English-only). Line endings preserved (CRLF).

### `adam/README.md`
Documents `site_id` (where it lives, why it is required, the empty-200 behavior, which
endpoints carry it), the delivery and retry rules, and how to run the tests.

### `tests/adam-client.test.mjs` (new)
Zero-dependency regression tests (`node --test`, Node's built-in runner, no npm, no
`package.json`, consistent with this repo's no-build policy). They run the client's **real
inline script** in a `vm` sandbox against a minimal fake DOM and a scripted `fetch`.

---

## 5. Testing evidence: summary

| # | Test | Environment | Result |
|---|---|---|---|
| A1 | `node --test`: 11 regression tests | Local, fixed branch | **11/11 pass** |
| A2 | Same 11 tests against the **original** `main` client (mutation check) | Local scratch copy | **7 fail** (`site_id` + delivery tests), 4 pass (pre-existing 403 / End-Session / polling behavior), so the tests catch the bug |
| A3 | JS syntax compile of the inline client script and `launcher.js` (`vm.Script`) | Local | Pass |
| A4 | Lint / type-check / build | — | **N/A**: the repo has no linter, type checker, `package.json` or build step (plain static site by design) |
| B0 | Root-cause repro: old payload (no `site_id`) | Local page → **live** backend | `200`, 0-byte body, **0 messages stored** (bug reproduced) |
| B1 | `hi`, **Send button** | Local fixed build → **live** backend | **Pass** |
| B2 | `Tell me about Silah Logistics.`, **Enter key** | same | **Pass** |
| B3 | `What services does Silah provide to customers?`, **Send button** | same | **Pass** |
| B4 | `How can I contact Silah Logistics?`, **Enter key** | same | **Pass** |
| B5 | Server-side storage check for the QA session | live backend (read-only fetch) | 4 client + 4 AI (`operator`) messages, 0 duplicate ids, baseline B0 not stored |
| B6 | `v0/fetch` with vs without `site_id` | live backend (read-only) | Byte-identical responses, so fetch left unchanged |
| B7 | Failure path: empty-200 → "Not delivered" → Retry → `{"status":"ok"}`; plus network error and HTTP 500 | Local, **send mocked in-page** (no traffic) | **Pass**: typing stops, Retry reuses the same `message_id`, 1 bubble, row cleared. Error and 500 each flagged. |
| B8 | Session resume: reload on a different page (`/how-it-works.html`) | Local → live backend | **Pass**: same session, intake skipped, 8 messages reloaded, mocked messages gone |
| B9 | **End Session** (close-session payload unchanged, no `site_id`) | Local → live backend | **Pass**: `{"ok":true}`, `SESSION_CLOSED` stored, UI reset to a new intake. Close-session left unchanged. |
| B10 | Arabic / RTL | Local | **Pass**: `dir="rtl"`, launcher and panel mirror to the left, conversation kept. Panel open/close keeps the iframe alive. |
| B11 | Console | Local | No page errors on load. The only warning was the expected `[ADAM] send failed` from the mocked network-error test. |
| B12 | Mobile width | — | **Not performed**: the browser window resize had no effect on the viewport. `launcher.js` (which owns the responsive behavior) is unchanged. |
| C1 | `app.silahlogistics.com` unchanged | Production (read-only `curl`) | `/adam/*` byte-identical to `ship-hub` `main`, home `200`. Nothing in `ship-hub` was modified. |
| C2 | `silahlogistics.com` + `www` current state | Production (read-only `curl`) | Both still serve the **old** client (0 `site_id` refs, `adam.config.js` 404), as expected since nothing is deployed |
| P1 | Production end-to-end after the fix | Production | **Not performed: fix not deployed** |

Browser tests ran in real Chrome against the **corrected local build** (served from this repo at
`http://localhost:8000`, through the real `index.html` → `layout.js` → `launcher.js` → iframe
path). The messages were typed into the real input and sent via the real Send button or Enter key.
A pass-through logger on the iframe's `fetch` recorded request and response bodies; it did not
alter them. The only exception is B7, where send was deliberately mocked.

---

## 6. Results (live backend, B1–B4)

Identical for all four messages:

- **Endpoint:** `POST https://srv395355.hstgr.cloud/webhook/adam/v0/send`
- **Payload keys:** `site_id, session_id, sender, message, message_id, group_id, group_name,
  client_name, client_mobile, client_email`. `site_id` = `"silah"`, present **exactly once**.
  `sender` = `"client"`, `session_id` = the session shown in the UI, a fresh `message_id` per message.
- **Response:** `HTTP 200`, body `{"status":"ok"}`
- **Stored:** yes, all four client messages appear in `v0/fetch` for the session
- **AI reply:** yes, one per message, stored with `sender: "operator"`, retrieved by the
  existing 5 s poll and rendered within 0–2 s of the check
- **UI:** reply visible, typing indicator stopped, input cleared, no duplicate bubbles, no
  "Not delivered" rows. Each next message in the same session also worked.

| Message | AI reply (first words) |
|---|---|
| `hi` | "Hello. How can I help you today?" |
| `Tell me about Silah Logistics.` | "Silah Logistics is a digital freight marketplace that connects businesses…" |
| `What services does Silah provide to customers?` | "Silah Logistics provides the following services to customers: 1. Shipment Requests…" |
| `How can I contact Silah Logistics?` | "You can contact Silah Logistics through the following channels: • Email: info@silahlogistics.com…" |

Screenshots (local, this machine): conversation after B4 and the "Not delivered · Retry" state
from B7: `C:\Users\Fawzy\AppData\Local\Temp\claude-chrome-screenshots-cfDiG0\`.

### Production side effects of testing (synthetic data only)

The tests talk to the **production** ADAM backend, so they created one clearly labelled QA
conversation in the operator inbox:

- **Session:** `171026135133_6697`, department **"other / اخري"** (id 30)
- **Contact:** `QA Test - automated (please ignore)`, `+1 555 010 0000`, `qa-test@example.com`
- **Records:** 4 client messages + 4 AI replies + 1 `SESSION_CLOSED` (End Session test)
- One rejected baseline send (B0) was **not** stored. Read-only calls (`list-groups`,
  `get-settings`, `fetch`) create nothing. No file was uploaded.

You may want to delete or ignore this session in the ADAM operator inbox.

---

## 7. Git changes

| | |
|---|---|
| Repository | `M-fawz/Silah_Logistics` (local) |
| Base | `main` @ `c2b77de` (matches production) |
| Branch | `fix/adam-main-site-site-id` |
| Fix commit | `96b3834`: `fix(adam): send site_id so main-site chat messages are stored and answered` |
| Report commit | the commit that adds this file (next on the same branch) |
| Changed files | `adam/ADAM-client.html`, `adam/README.md`, `tests/adam-client.test.mjs` (new), `CHATBOT_FIX_REPORT.md` (new) |
| Pushed / PR | **No.** Commits are local only. No push, no PR, no merge into `main`. |
| `ship-hub` | Not modified (read-only clone in a temp folder) |

---

## 8. Deployment status

**Not deployed.** Production (`silahlogistics.com`, `www.silahlogistics.com`) still serves the old
client, verified by `curl` after the fix was committed (0 `site_id` references).

To deploy, only **one file** needs to reach the server, `adam/ADAM-client.html`, at
`/adam/ADAM-client.html` (`public_html/adam/` on Hostinger, presumably). Production is otherwise
identical to `main`, so nothing unrelated would ship. `adam/README.md` and `tests/` are not
needed on the server (harmless if uploaded). No `adam.config.js` is required.

After uploading, verify:
1. `https://silahlogistics.com/adam/ADAM-client.html` contains `const SITE_ID = 'silah';`
   (also check `www.`). If not, purge the LiteSpeed/hPanel cache and hard-reload.
2. Send one message in the live chat. In DevTools → Network, the `v0/send` request body
   includes `"site_id":"silah"` and the response is `{"status":"ok"}`. An AI reply appears.

---

## 9. Remaining issues and follow-ups

1. **Deploy** `adam/ADAM-client.html` to Hostinger and run the two checks above (production
   end-to-end has not been verified).
2. **Backend (separate change, not made):** the send webhook answers a request with a missing or
   unknown `site_id` with `HTTP 200` + empty body. Returning a clear `4xx` (e.g.
   `{"status":"error","error":"missing site_id"}`) would make this class of failure obvious to
   any client. The n8n workflow was not inspected and nothing was changed there.
3. **App client (`ship-hub`):** its `sendText()` treats any `res.ok` as delivered, so an
   empty-body 200 would also go unnoticed there. Consider porting the non-empty-body check.
4. **Optional parity:** the app also sends `site_id` on `v0/fetch` and `v1/close-session`. Both
   work without it today (verified). Add it on the main site if the backend owner plans to
   require it.
5. **Not tested:** mobile-width layout of the new failure row (the viewport could not be resized
   in this session) and an end-to-end attachment upload (avoided writing a file to production).
6. **Pre-existing, unrelated:** at short desktop heights (~593 px) the open chat panel covers
   the navbar's language button.
7. **Cleanup:** the QA session `171026135133_6697` in the operator inbox (§6).

---

## 10. Final conclusion

**FIX IMPLEMENTED AND TESTED LOCALLY — PRODUCTION DEPLOYMENT PENDING**

The root cause is confirmed and fixed in source. The corrected client was verified end-to-end
against the live ADAM backend: messages stored, AI replies generated and displayed, typing
indicator cleared, no duplicates. Regression tests pass and fail correctly. The main website
is **not yet fixed in production** until `adam/ADAM-client.html` is deployed and re-verified.
