/* =====================================================================
   Layout — injects the shared chrome (navbar, sidebar, footer) into every
   page so it stays DRY and identical across the static HTML files.
   The active sidebar route is derived from <body data-page="...">.
   Translation + icon rendering happen afterwards (see main.js).
   ===================================================================== */
(function () {
  'use strict';

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
          '<a class="btn btn--primary btn--sm" href="register.html" data-i18n="common.register"></a>' +
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

  function footer() {
    var product = footerCol('footer.product', [
      { href: 'how-it-works.html', key: 'footer.links.services' },
      { href: 'quote-start.html', key: 'footer.links.quickQuote' },
      { href: '#', key: 'footer.links.rates', stub: true }
    ]);
    var company = footerCol('footer.company', [
      { href: 'about.html', key: 'footer.links.about' },
      { href: '#', key: 'footer.links.careers', stub: true },
      { href: '#', key: 'footer.links.contact', stub: true }
    ]);
    var legal = footerCol('footer.legal', [
      { href: 'privacy.html', key: 'footer.links.privacy' },
      { href: 'terms.html', key: 'footer.links.terms' },
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

  function render() {
    var page = document.body.getAttribute('data-page') || '';
    var activeNav = PAGE_NAV[page] || '';

    var navEl = document.getElementById('site-navbar');
    var sideEl = document.getElementById('site-sidebar');
    var footEl = document.getElementById('site-footer');

    if (navEl) navEl.innerHTML = navbar();
    if (sideEl) sideEl.innerHTML = sidebar(activeNav);
    if (footEl) footEl.innerHTML = footer();
  }

  window.Layout = { render: render };
})();
