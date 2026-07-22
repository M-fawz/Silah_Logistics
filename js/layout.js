/* =====================================================================
   Layout — injects the shared chrome (navbar, sidebar, footer) into every
   page so it stays DRY and identical across the static HTML files.
   The active sidebar route is derived from <body data-page="...">.
   Translation + icon rendering happen afterwards (see main.js).
   ===================================================================== */
(function () {
  'use strict';

  /* Single source of truth for the company's public contact details, so the
     footer, legal pages, and any future contact surface never drift apart. */
  var CONTACT = {
    phoneDisplay: '+44 7452 326110',
    phoneHref: 'tel:+447452326110',
    email: 'info@silahlogistics.com',
    linkedin: 'https://www.linkedin.com/company/silah-logistics/',
    facebook: 'https://www.facebook.com/profile.php?id=61591704263122',
    instagram: 'https://www.instagram.com/silahlogistics/'
  };

  function navbar() {
    return (
      '<div class="container navbar__inner">' +
        '<div class="navbar__left">' +
          '<button class="hamburger" type="button" data-menu-open data-i18n-aria="nav.openMenu">' +
            '<span data-icon="menu" class="icon icon-lg"></span>' +
          '</button>' +
          '<a class="brand" href="index.html" data-i18n-aria="common.appName">' +
            '<img class="brand__symbol" src="assets/symbol.png" alt="">' +
            '<img class="brand__wordmark" src="assets/wordmark.png" alt="Silah Logistics">' +
          '</a>' +
        '</div>' +
        '<div class="navbar__right">' +
          '<button class="lang-toggle" type="button" data-lang-toggle>' +
            '<span data-icon="globe" class="icon icon-sm"></span>' +
            '<span data-lang-label></span>' +
          '</button>' +
          '<a class="btn btn--primary btn--sm" href="https://app.silahlogistics.com/register" data-i18n="common.register"></a>' +
        '</div>' +
      '</div>'
    );
  }

  function sidebarLink(href, navKey, iconName, labelKey, activeNav, isStub) {
    var active = navKey && navKey === activeNav ? ' is-active' : '';
    var attrs = isStub ? ' data-stub' : '';
    var aria = navKey && navKey === activeNav ? ' aria-current="page"' : '';
    return (
      '<a class="sidebar__link' + active + '" href="' + href + '"' + attrs + aria + '>' +
        '<span data-icon="' + iconName + '" class="icon"></span>' +
        '<span data-i18n="' + labelKey + '"></span>' +
      '</a>'
    );
  }

  function sidebar(activeNav) {
    return (
      '<div class="sidebar__head">' +
        '<span class="sidebar__appname" data-i18n="common.appName"></span>' +
        '<button class="sidebar__close" type="button" data-menu-close data-i18n-aria="nav.closeMenu">' +
          '<span data-icon="x" class="icon"></span>' +
        '</button>' +
      '</div>' +
      '<nav class="sidebar__nav" data-i18n-aria="sidebar.navigation">' +
        '<div class="sidebar__group">' +
          '<p class="sidebar__grouplabel" data-i18n="sidebar.quickQuote"></p>' +
          sidebarLink('quote-start.html', 'getQuote', 'file-plus', 'sidebar.getQuote', activeNav, false) +
        '</div>' +
        '<div class="sidebar__group">' +
          '<p class="sidebar__grouplabel" data-i18n="sidebar.navigation"></p>' +
          sidebarLink('how-it-works.html', 'services', 'layers', 'sidebar.services', activeNav, false) +
          sidebarLink('about.html', 'about', 'info', 'sidebar.about', activeNav, false) +
        '</div>' +
        '<div class="sidebar__group">' +
          '<p class="sidebar__grouplabel" data-i18n="sidebar.legal"></p>' +
          sidebarLink('privacy.html', 'privacy', 'shield-check', 'sidebar.privacy', activeNav, false) +
          sidebarLink('terms.html', 'terms', 'file-text', 'sidebar.terms', activeNav, false) +
        '</div>' +
      '</nav>' +
      '<div class="sidebar__foot">© <span data-year></span> ' +
        '<span data-i18n="common.appName"></span></div>'
    );
  }

  function footerCol(titleKey, links) {
    var items = links
      .map(function (l) {
        var attrs = l.stub ? ' data-stub' : '';
        return (
          '<li><a href="' + l.href + '"' + attrs + ' data-i18n="' + l.key + '"></a></li>'
        );
      })
      .join('');
    return (
      '<div>' +
        '<h3 class="footer__coltitle" data-i18n="' + titleKey + '"></h3>' +
        '<ul class="footer__links">' + items + '</ul>' +
      '</div>'
    );
  }

  // Contact + social block shown in the footer's brand column. Every item is
  // clickable (tel:/mailto:/external) with an icon; external social links open
  // in a new tab. The phone number is wrapped in a dir="ltr" run so it never
  // reverses under the Arabic (RTL) layout.
  function contactBlock() {
    var social = [
      { href: CONTACT.linkedin, icon: 'linkedin', label: 'LinkedIn' },
      { href: CONTACT.facebook, icon: 'facebook', label: 'Facebook' },
      { href: CONTACT.instagram, icon: 'instagram', label: 'Instagram' }
    ]
      .map(function (s) {
        return (
          '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '" title="' + s.label + '">' +
            '<span data-icon="' + s.icon + '" class="icon"></span>' +
          '</a>'
        );
      })
      .join('');

    return (
      '<div class="footer__contact">' +
        '<a href="' + CONTACT.phoneHref + '">' +
          '<span data-icon="phone" class="icon icon-sm"></span>' +
          '<span class="ltr-num" dir="ltr">' + CONTACT.phoneDisplay + '</span>' +
        '</a>' +
        '<a href="mailto:' + CONTACT.email + '">' +
          '<span data-icon="mail" class="icon icon-sm"></span>' +
          '<span>' + CONTACT.email + '</span>' +
        '</a>' +
      '</div>' +
      '<div class="footer__social" data-i18n-aria="footer.followUs">' + social + '</div>'
    );
  }

  function footer() {
    var product = footerCol('footer.product', [
      { href: 'https://app.silahlogistics.com/how-it-works', key: 'footer.links.services' },
      { href: 'https://app.silahlogistics.com/quick-quote/wizard', key: 'footer.links.quickQuote' },
      { href: 'https://app.silahlogistics.com/', key: 'footer.links.rates' }
    ]);
    var company = footerCol('footer.company', [
      { href: 'https://app.silahlogistics.com/about', key: 'footer.links.about' },
      { href: '#', key: 'footer.links.careers', stub: true },
      { href: 'mailto:' + CONTACT.email, key: 'footer.links.contact' }
    ]);
    var legal = footerCol('footer.legal', [
      { href: 'https://app.silahlogistics.com/privacy', key: 'footer.links.privacy' },
      { href: 'https://app.silahlogistics.com/terms', key: 'footer.links.terms' },
      { href: '#', key: 'footer.links.cookies', stub: true }
    ]);

    return (
      '<div class="container footer__inner">' +
        '<div class="footer__grid">' +
          '<div>' +
            '<div class="footer__brand">' +
              '<img src="assets/symbol.png" alt="">' +
              '<span data-i18n="common.appName"></span>' +
            '</div>' +
            '<p class="footer__tagline" data-i18n="footer.tagline"></p>' +
            contactBlock() +
          '</div>' +
          product + company + legal +
        '</div>' +
        '<div class="footer__bottom">' +
          '<p>© <span data-year></span> <span data-i18n="common.appName"></span>. ' +
            '<span data-i18n="footer.rights"></span></p>' +
        '</div>' +
      '</div>'
    );
  }

  // Map <body data-page> -> active sidebar nav key.
  var PAGE_NAV = {
    home: '',
    'how-it-works': 'services',
    'quote-start': 'getQuote',
    'quote-wizard': 'getQuote',
    about: 'about',
    privacy: 'privacy',
    terms: 'terms'
  };

  // Load the site-wide ADAM support chat launcher exactly once. Kept here (in the
  // shared chrome) so every page gets the floating widget without duplicating a
  // <script> tag across all the HTML files.
  function mountAdamLauncher() {
    if (document.getElementById('adam-launcher-js')) return;
    var s = document.createElement('script');
    s.id = 'adam-launcher-js';
    s.src = 'adam/launcher.js';
    s.defer = true;
    document.body.appendChild(s);
  }

  function render() {
    var page = document.body.getAttribute('data-page') || '';
    var activeNav = PAGE_NAV[page] || '';

    var navEl = document.getElementById('site-navbar');
    var sideEl = document.getElementById('site-sidebar');
    var footEl = document.getElementById('site-footer');

    if (navEl) navEl.innerHTML = navbar();
    if (sideEl) sideEl.innerHTML = sidebar(activeNav);
    if (footEl) footEl.innerHTML = footer();

    mountAdamLauncher();
  }

  window.Layout = { render: render };
})();
