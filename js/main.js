/* =====================================================================
   main.js — app bootstrap + shared behaviors:
     • render layout chrome, apply translations, render icons
     • mobile sidebar drawer (open/close/overlay/Escape/resize)
     • language toggle wiring
     • non-functional "stub" links -> toast
     • scroll-reveal (IntersectionObserver)
     • animated count-up stats (IntersectionObserver, locale-aware)
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------- helpers --------------------------- */
  function formatNumber(value, decimals) {
    var d = decimals || 0;
    try {
      return new Intl.NumberFormat(window.I18n ? I18n.locale() : 'en', {
        minimumFractionDigits: d,
        maximumFractionDigits: d
      }).format(value);
    } catch (e) {
      return d ? value.toFixed(d) : String(Math.round(value));
    }
  }

  /* ----------------------------- count-up -------------------------- */
  var countEls = [];

  function renderCount(el, value) {
    el._cuCurrent = value;
    el.textContent =
      (el._cuPrefix || '') + formatNumber(value, el._cuDecimals) + (el._cuSuffix || '');
  }

  function animateCount(el) {
    var dur = 1800;
    var start = null;
    var target = el._cuValue;
    function ease(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      renderCount(el, target * ease(p));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        renderCount(el, target);
        el._cuDone = true;
      }
    }
    requestAnimationFrame(tick);
  }

  function setupCountUp() {
    countEls = Array.prototype.slice.call(document.querySelectorAll('.countup'));
    countEls.forEach(function (el) {
      el._cuValue = parseFloat(el.getAttribute('data-value')) || 0;
      el._cuDecimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
      el._cuSuffix = el.getAttribute('data-suffix') || '';
      el._cuPrefix = el.getAttribute('data-prefix') || '';
      el._cuDone = false;
      renderCount(el, reduceMotion ? el._cuValue : 0);
      if (reduceMotion) el._cuDone = true;
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      countEls.forEach(function (el) {
        renderCount(el, el._cuValue);
        el._cuDone = true;
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    countEls.forEach(function (el) {
      io.observe(el);
    });
  }

  function reformatCounts() {
    countEls.forEach(function (el) {
      renderCount(el, el._cuDone ? el._cuValue : el._cuCurrent || 0);
    });
  }

  /* ----------------------------- reveal ---------------------------- */
  function setupReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var el = e.target;
            var d = el.getAttribute('data-delay');
            if (d) el.style.transitionDelay = d + 's';
            el.classList.add('is-visible');
            io.unobserve(el);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --------------------------- sidebar drawer ---------------------- */
  function sidebarEl() {
    return document.getElementById('site-sidebar');
  }
  function overlayEl() {
    return document.getElementById('sidebar-overlay');
  }
  function openMenu() {
    var s = sidebarEl();
    var o = overlayEl();
    if (s) s.classList.add('is-open');
    if (o) o.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    var s = sidebarEl();
    var o = overlayEl();
    if (s) s.classList.remove('is-open');
    if (o) o.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ----------------------------- toast ----------------------------- */
  var toastEl, toastTimer;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // Force reflow so the transition replays on rapid repeat clicks.
    void toastEl.offsetWidth;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 2600);
  }

  /* --------------------------- event wiring ------------------------ */
  function wireGlobalClicks() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-open]')) {
        e.preventDefault();
        openMenu();
        return;
      }
      if (e.target.closest('[data-menu-close]')) {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.target.id === 'sidebar-overlay') {
        closeMenu();
        return;
      }
      var langBtn = e.target.closest('[data-lang-toggle]');
      if (langBtn) {
        e.preventDefault();
        if (window.I18n) I18n.toggle();
        return;
      }
      var stub = e.target.closest('[data-stub]');
      if (stub) {
        e.preventDefault();
        var label = (stub.textContent || '').trim();
        var soon = window.I18n ? I18n.t('common.comingSoon') : 'Coming soon';
        showToast(label ? label + ' — ' + soon : soon);
        if (stub.closest('.sidebar')) closeMenu();
        return;
      }
      // Any real sidebar link click (mobile) closes the drawer.
      if (e.target.closest('.sidebar__link')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  function setYear() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = y;
    });
  }

  /* ------------------------------ boot ----------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.Layout) Layout.render();
    if (window.I18n) I18n.init();
    if (window.Icons) Icons.render(document);

    wireGlobalClicks();
    setYear();
    setupReveal();
    setupCountUp();

    if (document.body.getAttribute('data-page') === 'quote-wizard' && window.Wizard) {
      Wizard.init();
    }

    document.addEventListener('silah:langchange', function () {
      reformatCounts();
      setYear();
      if (window.Wizard && Wizard.onLangChange) Wizard.onLangChange();
    });
  });

  window.SilahMain = { formatNumber: formatNumber };
})();
