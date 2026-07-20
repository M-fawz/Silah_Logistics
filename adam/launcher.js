/*
 * @file /adam/launcher.js
 * @description Site-wide floating ADAM support-chat widget for the Silah Logistics
 *              static site. Injected once from js/layout.js (mountAdamLauncher) so it
 *              appears on EVERY page. Clicking the launcher opens the ADAM support chat
 *              (adam/ADAM-client.html) INLINE inside a floating panel — an Intercom /
 *              Crisp / Zendesk-style widget — WITHOUT navigating away from the page.
 *
 *              The chat itself (departments, send/receive, polling, uploads, session
 *              persistence, End Session → new session) lives untouched in
 *              ADAM-client.html and runs inside the iframe. The iframe is same-origin,
 *              so it shares localStorage with the host page and keeps its session across
 *              page loads. It is lazy-loaded on first open and then kept alive (only
 *              hidden) so polling / unread state survive closing the panel.
 * @owner adam-support-chat
 */
(function () {
  'use strict';

  // Idempotency guard — never inject the widget twice.
  if (window.__adamLauncherMounted) return;
  window.__adamLauncherMounted = true;

  /* Relative paths — resolved against the host page, which lives at the site root
     (index.html, about.html, …). The launcher must stay HTTPS-safe: it only loads
     the local ADAM client, which itself talks to the HTTPS backend. */
  var CLIENT_URL = 'adam/ADAM-client.html';
  var LOGO_WHITE = 'adam/assets/adam-logo-white.png';
  var ACTIVE_SESSION_KEY = 'adam_active_session';

  /* ── Stable per-browser session id (matches the ADAM client's id format) ───── */
  function generateSessionId() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var ts =
      pad(d.getDate()) + pad(d.getMonth() + 1) + String(d.getFullYear()).slice(-2) +
      pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    return ts + '_' + Math.floor(1000 + Math.random() * 9000);
  }

  function getSessionId() {
    var sid = null;
    try { sid = localStorage.getItem(ACTIVE_SESSION_KEY); } catch (e) { /* ignore */ }
    if (!sid) {
      sid = generateSessionId();
      try { localStorage.setItem(ACTIVE_SESSION_KEY, sid); } catch (e) { /* ignore */ }
    }
    return sid;
  }

  /* ── State ─────────────────────────────────────────────────────────────────── */
  var isOpen = false;
  var iframeLoaded = false;

  /* ── Styles (scoped to the widget, kept fully outside the site's own CSS) ───── */
  function injectStyles() {
    if (document.getElementById('adam-widget-style')) return;
    var isRtl = (document.documentElement.getAttribute('dir') === 'rtl');
    var side = isRtl ? 'left' : 'right';
    var origin = isRtl ? 'bottom left' : 'bottom right';

    var style = document.createElement('style');
    style.id = 'adam-widget-style';
    style.textContent = [
      /* keyframes */
      '@keyframes adamLauncherPulse{0%{transform:scale(1);opacity:.5}70%{transform:scale(1.9);opacity:0}100%{opacity:0}}',
      '@keyframes adamLauncherIn{from{opacity:0;transform:scale(.6) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      '@keyframes adamLauncherBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',

      /* ── Launcher FAB ────────────────────────────────────────────────────── */
      '#adam-launcher-root{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom,0px));' + side + ':24px;width:60px;height:60px;' +
        'z-index:2147483000;pointer-events:auto;font-family:"Inter","DM Sans",system-ui,sans-serif;' +
        'animation:adamLauncherBob 3.6s ease-in-out infinite;}',
      '#adam-launcher-root .adam-pulse{position:absolute;inset:0;border-radius:20px;background:#E8641C;' +
        'animation:adamLauncherPulse 2.8s cubic-bezier(.2,.6,.4,1) infinite;pointer-events:none;}',
      '#adam-launcher-root.is-open .adam-pulse{display:none;}',
      '#adam-launcher-btn{position:relative;width:100%;height:100%;border:none;border-radius:20px;cursor:pointer;' +
        'background:linear-gradient(140deg,#F5883A,#E8641C);' +
        'box-shadow:0 14px 30px -8px rgba(232,100,28,.6),0 4px 10px rgba(40,20,8,.28);' +
        'display:flex;align-items:center;justify-content:center;' +
        'animation:adamLauncherIn .5s cubic-bezier(.22,1,.32,1.5) both;' +
        'transition:transform .18s ease, box-shadow .18s ease;}',
      '#adam-launcher-btn:hover{transform:scale(1.07) translateY(-1px);' +
        'box-shadow:0 18px 38px -8px rgba(232,100,28,.7),0 6px 14px rgba(40,20,8,.32);}',
      '#adam-launcher-btn:active{transform:scale(.95);}',
      '#adam-launcher-btn:focus-visible{outline:3px solid rgba(10,42,102,.55);outline-offset:3px;}',
      /* icon swap: logo when closed, chevron-down when open */
      '#adam-launcher-btn .adam-ic{position:absolute;transition:opacity .2s ease, transform .2s ease;}',
      '#adam-launcher-btn .adam-ic-logo{width:34px;height:34px;object-fit:contain;pointer-events:none;}',
      '#adam-launcher-btn .adam-ic-close{width:26px;height:26px;opacity:0;transform:rotate(-90deg) scale(.6);}',
      '#adam-launcher-root.is-open #adam-launcher-btn .adam-ic-logo{opacity:0;transform:rotate(90deg) scale(.6);}',
      '#adam-launcher-root.is-open #adam-launcher-btn .adam-ic-close{opacity:1;transform:rotate(0) scale(1);}',

      /* tooltip */
      '#adam-launcher-tip{position:absolute;bottom:50%;' + side + ':72px;transform:translateY(50%);' +
        'background:#0A2A66;color:#fff;font-size:12.5px;font-weight:600;white-space:nowrap;' +
        'padding:7px 12px;border-radius:10px;box-shadow:0 8px 20px -6px rgba(7,30,74,.45);' +
        'opacity:0;pointer-events:none;transition:opacity .18s ease;}',
      '#adam-launcher-root:not(.is-open):hover #adam-launcher-tip{opacity:1;}',

      /* ── Chat panel ──────────────────────────────────────────────────────── */
      '#adam-chat-panel{position:fixed;bottom:calc(100px + env(safe-area-inset-bottom,0px));' + side + ':24px;' +
        'width:400px;max-width:calc(100vw - 32px);height:640px;max-height:calc(100vh - 132px);' +
        'background:#FBF7F1;border-radius:20px;overflow:hidden;z-index:2147483001;' +
        'display:flex;flex-direction:column;' +
        'box-shadow:0 26px 60px -16px rgba(7,30,74,.42),0 10px 24px -12px rgba(40,20,8,.28);' +
        'font-family:"Inter","DM Sans",system-ui,sans-serif;' +
        'opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(.98);transform-origin:' + origin + ';' +
        'transition:opacity .26s ease, transform .3s cubic-bezier(.22,1,.32,1.15), visibility 0s linear .3s;}',
      '#adam-chat-panel.is-open{opacity:1;visibility:visible;pointer-events:auto;transform:none;' +
        'transition:opacity .28s ease, transform .34s cubic-bezier(.22,1,.32,1.2), visibility 0s;}',

      /* slim widget title bar (site chrome — navy, ties the ADAM chat to Silah) */
      '#adam-panel-bar{flex:0 0 auto;display:flex;align-items:center;gap:10px;height:48px;padding:0 10px 0 14px;' +
        'background:linear-gradient(135deg,#0A2A66,#071E4A);color:#fff;}',
      '#adam-panel-bar .adam-bar-logo{width:24px;height:24px;border-radius:7px;object-fit:contain;' +
        'background:linear-gradient(140deg,#F5883A,#E8641C);padding:3px;flex:0 0 auto;}',
      '#adam-panel-bar .adam-bar-title{font-size:14px;font-weight:700;letter-spacing:.01em;}',
      '#adam-panel-bar .adam-bar-dot{width:7px;height:7px;border-radius:50%;background:#4FA36B;flex:0 0 auto;' +
        'box-shadow:0 0 0 3px rgba(79,163,107,.25);}',
      '#adam-panel-bar .adam-bar-sub{font-size:11px;font-weight:500;opacity:.72;margin-left:2px;}',
      /* Bar is forced LTR, so the minimize button always sits at the far (right) end. */
      '#adam-panel-close{margin-left:auto;width:32px;height:32px;flex:0 0 auto;' +
        'border:none;border-radius:9px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;transition:background .15s, transform .1s;}',
      '#adam-panel-close:hover{background:rgba(255,255,255,.24);}',
      '#adam-panel-close:active{transform:scale(.92);}',
      '#adam-panel-close:focus-visible{outline:2px solid #fff;outline-offset:2px;}',

      /* iframe fills the rest */
      '#adam-frame{flex:1 1 auto;width:100%;border:0;display:block;background:#FBF7F1;}',

      /* ── Responsive ──────────────────────────────────────────────────────── */
      /* Tablet: keep it floating but never overflow the viewport. */
      '@media (max-width:768px){#adam-chat-panel{width:min(400px,calc(100vw - 28px));height:calc(100vh - 128px);}}',
      /* Mobile: go full-screen and hide the FAB while open (so it never covers the */
      /* ADAM message input) — closing then happens from the title bar button.      */
      '@media (max-width:560px){' +
        '#adam-chat-panel{' + side + ':0;left:0;right:0;bottom:0;top:0;width:100%;max-width:100%;' +
          'height:100%;max-height:100%;height:100dvh;max-height:100dvh;border-radius:0;transform-origin:center bottom;}' +
        '#adam-launcher-tip{display:none;}' +
        '#adam-launcher-root.is-open{display:none;}' +
      '}',

      /* Respect reduced-motion — kill the idle bob + soften transitions. */
      '@media (prefers-reduced-motion:reduce){' +
        '#adam-launcher-root{animation:none;}' +
        '#adam-chat-panel{transition:opacity .2s ease, visibility 0s;transform:none;}' +
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Open / close ──────────────────────────────────────────────────────────── */
  function openChat() {
    var panel = document.getElementById('adam-chat-panel');
    var root = document.getElementById('adam-launcher-root');
    var frame = document.getElementById('adam-frame');
    var btn = document.getElementById('adam-launcher-btn');
    if (!panel || !frame) return;

    // Lazy-load the ADAM client on first open, resuming this browser's session.
    if (!iframeLoaded) {
      frame.src = CLIENT_URL + '?session=' + encodeURIComponent(getSessionId());
      iframeLoaded = true;
    }

    panel.classList.add('is-open');
    if (root) root.classList.add('is-open');
    if (btn) btn.setAttribute('aria-label', 'Close ADAM support chat');
    panel.setAttribute('aria-hidden', 'false');
    isOpen = true;

    // Hand focus to the chat so keyboard users land inside it.
    setTimeout(function () { try { frame.focus(); } catch (e) { /* ignore */ } }, 60);
  }

  function closeChat() {
    var panel = document.getElementById('adam-chat-panel');
    var root = document.getElementById('adam-launcher-root');
    var btn = document.getElementById('adam-launcher-btn');
    if (!panel) return;

    panel.classList.remove('is-open');
    if (root) root.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-label', 'Chat with ADAM support');
    panel.setAttribute('aria-hidden', 'true');
    isOpen = false;
    // The iframe is intentionally kept alive (only hidden) so polling, unread state
    // and the active session all survive a close/reopen.
    if (btn) { try { btn.focus(); } catch (e) { /* ignore */ } }
  }

  function toggleChat() { isOpen ? closeChat() : openChat(); }

  /* ── Build the widget DOM (kept fully outside the site's #page-root) ────────── */
  function mount() {
    if (document.getElementById('adam-launcher-root')) return;
    injectStyles();

    /* Chat panel + iframe */
    var panel = document.createElement('div');
    panel.id = 'adam-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ADAM support chat');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('dir', 'ltr');
    panel.innerHTML =
      '<div id="adam-panel-bar">' +
        '<img class="adam-bar-logo" src="' + LOGO_WHITE + '" alt="">' +
        '<span class="adam-bar-title">Live Support</span>' +
        '<span class="adam-bar-dot" aria-hidden="true"></span>' +
        '<span class="adam-bar-sub">Online</span>' +
        '<button id="adam-panel-close" type="button" aria-label="Minimize chat" title="Minimize">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button>' +
      '</div>' +
      '<iframe id="adam-frame" title="ADAM Support Chat" allow="clipboard-write" ' +
        'referrerpolicy="no-referrer-when-downgrade"></iframe>';

    /* Launcher FAB */
    var root = document.createElement('div');
    root.id = 'adam-launcher-root';
    root.setAttribute('dir', 'ltr');

    var pulse = document.createElement('span');
    pulse.className = 'adam-pulse';

    var btn = document.createElement('button');
    btn.id = 'adam-launcher-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Chat with ADAM support');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML =
      '<img class="adam-ic adam-ic-logo" src="' + LOGO_WHITE + '" alt="ADAM">' +
      '<svg class="adam-ic adam-ic-close" viewBox="0 0 24 24" fill="none" stroke="#fff" ' +
        'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M6 9l6 6 6-6"/></svg>';

    var tip = document.createElement('div');
    tip.id = 'adam-launcher-tip';
    tip.textContent = 'Chat with ADAM';

    root.appendChild(pulse);
    root.appendChild(btn);
    root.appendChild(tip);

    document.body.appendChild(panel);
    document.body.appendChild(root);

    /* Wiring */
    btn.addEventListener('click', toggleChat);
    document.getElementById('adam-panel-close').addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeChat();
    });

    // Re-mirror the widget (FAB corner + panel origin) when the site language flips
    // between EN (LTR) and AR (RTL) without a full page reload.
    document.addEventListener('silah:langchange', function () {
      var existing = document.getElementById('adam-widget-style');
      if (existing) existing.remove();
      injectStyles();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
