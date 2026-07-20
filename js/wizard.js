/* =====================================================================
   wizard.js — 3-step Quick Quote wizard (vanilla).
     Step 1: searchable origin/destination comboboxes + cargo-type cards
     Step 2: weight / unit / container / special requirements
     Step 3: contact details -> quote summary
   Relies on the static markup in quote-wizard.html (data-* hooks below).
   ===================================================================== */
(function () {
  'use strict';

  var TOTAL = 3;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var state = {
    step: 0,
    origin: null,
    destination: null,
    cargoType: '',
    weight: '',
    unitType: '',
    containerType: '',
    special: '',
    email: '',
    phone: '',
    date: ''
  };

  var errors = {}; // field -> i18n key
  var comboboxes = []; // controller objects
  var lastResult = null; // { quotes } for re-render on language change

  var els = {};

  function t(key, vars) {
    return window.I18n ? I18n.t(key, vars) : key;
  }

  /* --------------------------- validation -------------------------- */
  var STEP_FIELDS = [
    ['origin', 'destination', 'cargoType'],
    ['weight', 'unitType', 'containerType'],
    ['email', 'phone', 'date']
  ];

  function setError(field, key) {
    errors[field] = key || null;
    applyError(field);
  }

  function applyError(field) {
    var wrap = els.form.querySelector('[data-field="' + field + '"]');
    var msg = els.form.querySelector('[data-error="' + field + '"]');
    var key = errors[field];
    if (wrap) wrap.classList.toggle('has-error', !!key);
    if (msg) msg.textContent = key ? t(key) : '';
  }

  function applyAllErrors() {
    Object.keys(errors).forEach(applyError);
  }

  function validateField(field) {
    switch (field) {
      case 'origin':
        return state.origin ? null : 'wizard.validation.originRequired';
      case 'destination':
        if (!state.destination) return 'wizard.validation.destinationRequired';
        if (state.origin && state.destination.id === state.origin.id)
          return 'wizard.validation.sameLocation';
        return null;
      case 'cargoType':
        return state.cargoType ? null : 'wizard.validation.cargoTypeRequired';
      case 'weight':
        if (!String(state.weight).trim()) return 'wizard.validation.weightRequired';
        if (!(Number(state.weight) > 0)) return 'wizard.validation.weightPositive';
        return null;
      case 'unitType':
        return state.unitType ? null : 'wizard.validation.unitRequired';
      case 'containerType':
        return state.containerType ? null : 'wizard.validation.containerRequired';
      case 'email':
        if (!state.email.trim()) return 'wizard.validation.emailRequired';
        if (!EMAIL_RE.test(state.email)) return 'wizard.validation.emailInvalid';
        return null;
      case 'phone':
        return state.phone.trim() ? null : 'wizard.validation.phoneRequired';
      case 'date':
        return state.date ? null : 'wizard.validation.dateRequired';
      default:
        return null;
    }
  }

  function validateStep(i) {
    var ok = true;
    STEP_FIELDS[i].forEach(function (field) {
      var key = validateField(field);
      setError(field, key);
      if (key) ok = false;
    });
    return ok;
  }

  /* ----------------------------- stepper --------------------------- */
  function renderStepper() {
    var steps = els.stepper.querySelectorAll('.stepper__step');
    steps.forEach(function (li, idx) {
      var circle = li.querySelector('.stepper__circle');
      li.classList.remove('is-active', 'is-done');
      li.removeAttribute('aria-current');
      if (idx < state.step) {
        li.classList.add('is-done');
        circle.innerHTML = window.Icons ? Icons.markup('check') : '✓';
      } else if (idx === state.step) {
        li.classList.add('is-active');
        li.setAttribute('aria-current', 'step');
        circle.textContent = String(idx + 1);
      } else {
        circle.textContent = String(idx + 1);
      }
    });
    var lines = els.stepper.querySelectorAll('.stepper__line');
    lines.forEach(function (line, idx) {
      line.classList.toggle('is-done', idx < state.step);
    });
  }

  /* ------------------------- step navigation ----------------------- */
  function showStep(i) {
    state.step = i;
    els.form.querySelectorAll('.wizard-step').forEach(function (panel) {
      panel.hidden = parseInt(panel.getAttribute('data-step'), 10) !== i;
    });
    renderStepper();
    renderNav();
  }

  function renderNav() {
    var back = els.back;
    var next = els.next;
    var submit = els.submit;

    // Back button content depends on whether we are on step 0.
    if (state.step === 0) {
      back.innerHTML = '<span>' + t('common.backHome') + '</span>';
    } else {
      back.innerHTML =
        '<span class="icon-slot"></span><span>' + t('wizard.back') + '</span>';
      back.querySelector('.icon-slot').outerHTML = window.Icons
        ? Icons.markup('arrow-left', 'icon-sm rtl-flip')
        : '';
    }

    next.hidden = state.step >= TOTAL - 1;
    submit.hidden = state.step < TOTAL - 1;
  }

  /* ----------------------------- combobox -------------------------- */
  function createCombobox(container) {
    var name = container.getAttribute('data-combobox');
    var input = container.querySelector('.combobox__input');
    var clearBtn = container.querySelector('.combobox__clear');
    var list = document.createElement('ul');
    list.className = 'combobox__list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    container.appendChild(list);

    var open = false;
    var query = '';
    var highlight = 0;
    var results = [];

    function display() {
      var v = state[name];
      input.value = open ? query : v ? v.name + ' (' + v.code + ')' : '';
      input.classList.toggle('has-value', !!v);
      clearBtn.hidden = !(v && !open);
      input.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function renderList() {
      list.innerHTML = '';
      if (!open) {
        list.hidden = true;
        return;
      }
      list.hidden = false;
      results = window.SilahData ? SilahData.searchPorts(query) : [];
      if (results.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'combobox__empty';
        empty.textContent = t('wizard.combobox.noResults');
        list.appendChild(empty);
        return;
      }
      if (highlight > results.length - 1) highlight = results.length - 1;
      if (highlight < 0) highlight = 0;
      results.forEach(function (item, idx) {
        var li = document.createElement('li');
        li.className = 'combobox__option' + (idx === highlight ? ' is-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', idx === highlight ? 'true' : 'false');

        var main = document.createElement('span');
        main.className = 'combobox__option-main';
        var nm = document.createElement('span');
        nm.className = 'combobox__option-name';
        nm.textContent = item.name;
        var sub = document.createElement('span');
        sub.className = 'combobox__option-sub';
        sub.textContent = item.country + ' • ' + item.region;
        main.appendChild(nm);
        main.appendChild(sub);

        var code = document.createElement('span');
        code.className = 'combobox__code';
        code.textContent = item.code;

        li.appendChild(main);
        li.appendChild(code);

        li.addEventListener('mouseenter', function () {
          highlight = idx;
          renderList();
        });
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          select(item);
        });
        list.appendChild(li);
      });
    }

    function openListView() {
      open = true;
      display();
      renderList();
    }
    function closeListView() {
      open = false;
      display();
      renderList();
    }
    function select(item) {
      state[name] = item;
      query = '';
      open = false;
      setError(name, null);
      // Re-validate destination vs origin coupling.
      if (name === 'origin' && state.destination) setError('destination', validateField('destination'));
      display();
      renderList();
      input.blur();
    }
    function clearValue() {
      state[name] = null;
      query = '';
      open = true;
      display();
      renderList();
      input.focus();
    }

    input.addEventListener('focus', openListView);
    input.addEventListener('input', function () {
      query = input.value;
      open = true;
      highlight = 0;
      display();
      renderList();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) openListView();
        highlight = Math.min(highlight + 1, results.length - 1);
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight = Math.max(highlight - 1, 0);
        renderList();
      } else if (e.key === 'Enter') {
        if (open && results[highlight]) {
          e.preventDefault();
          select(results[highlight]);
        }
      } else if (e.key === 'Escape') {
        closeListView();
      }
    });
    clearBtn.addEventListener('click', clearValue);

    document.addEventListener('mousedown', function (e) {
      if (open && !container.contains(e.target)) closeListView();
    });

    display();

    return {
      name: name,
      refresh: function () {
        // Called on language change: keep selection, refresh visible text.
        if (open) {
          open = false;
        }
        display();
        renderList();
      }
    };
  }

  /* ------------------------- cargo type cards ---------------------- */
  function setCargoType(value) {
    state.cargoType = value;
    if (els.cargoSelect) els.cargoSelect.value = value;
    els.form.querySelectorAll('[data-cargo]').forEach(function (card) {
      card.classList.toggle('is-selected', card.getAttribute('data-cargo') === value);
      card.setAttribute('aria-pressed', card.getAttribute('data-cargo') === value ? 'true' : 'false');
    });
    setError('cargoType', null);
  }

  /* ----------------------------- result ---------------------------- */
  function buildQuotes(weight, cargoType) {
    var w = Math.max(isFinite(weight) ? weight : 0, 1);
    var factor =
      cargoType === 'air' ? 6.5 : cargoType === 'fcl' ? 1 : cargoType === 'lcl' ? 1.4 : 0.8;
    var base = 600 + w * factor;
    var fast = cargoType === 'air';
    return [
      { id: 'a', carrierKey: 'wizard.result.carrierA', price: Math.round(base * 1.08), days: fast ? 4 : 28, tagKey: 'wizard.result.bestValue', highlight: false },
      { id: 'b', carrierKey: 'wizard.result.carrierB', price: Math.round(base * 1.25), days: fast ? 3 : 23, tagKey: 'wizard.result.fastest', highlight: false },
      { id: 'c', carrierKey: 'wizard.result.carrierC', price: Math.round(base * 1.15), days: fast ? 5 : 26, tagKey: 'wizard.result.recommended', highlight: true }
    ];
  }

  function money(value) {
    try {
      return new Intl.NumberFormat(I18n.locale(), {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    } catch (e) {
      return '$' + value;
    }
  }

  function num(value) {
    return window.SilahMain ? SilahMain.formatNumber(value, 0) : String(value);
  }

  function renderResult() {
    var quotes = lastResult.quotes;
    var html = '';

    html +=
      '<div class="result__head">' +
      '<span class="result__check"><span data-icon="check-circle"></span></span>' +
      '<h1>' + t('wizard.result.title') + '</h1>' +
      '<p>' +
      t('wizard.result.subtitle', {
        origin: state.origin ? state.origin.name : '',
        destination: state.destination ? state.destination.name : ''
      }) +
      '</p>' +
      '</div>';

    html +=
      '<div class="card summary">' +
      '<h2>' + t('wizard.result.summaryTitle') + '</h2>' +
      '<dl class="summary__grid">' +
      '<div><dt>' + t('wizard.shipment.origin') + '</dt><dd>' + (state.origin ? state.origin.code : '') + '</dd></div>' +
      '<div><dt>' + t('wizard.shipment.destination') + '</dt><dd>' + (state.destination ? state.destination.code : '') + '</dd></div>' +
      '<div><dt>' + t('wizard.shipment.cargoType') + '</dt><dd>' + (state.cargoType ? t('wizard.shipment.cargoTypes.' + state.cargoType) : '') + '</dd></div>' +
      '<div><dt>' + t('wizard.cargo.weight') + '</dt><dd>' + num(Number(state.weight)) + ' kg</dd></div>' +
      '</dl>' +
      '</div>';

    html += '<div class="quotes-grid">';
    quotes.forEach(function (q) {
      html +=
        '<div class="quote-card' + (q.highlight ? ' is-highlight' : '') + '">' +
        '<span class="quote-tag">' + t(q.tagKey) + '</span>' +
        '<p class="quote-card__carrier">' + t(q.carrierKey) + '</p>' +
        '<p class="quote-card__price">' + money(q.price) + '</p>' +
        '<p class="quote-card__transit">' + t('wizard.result.transit') + ': ~' + num(q.days) + ' ' + t('wizard.result.days') + '</p>' +
        '<button type="button" class="btn ' + (q.highlight ? 'btn--primary' : 'btn--secondary') + ' btn--block" data-stub>' + t('wizard.result.selectQuote') + '</button>' +
        '</div>';
    });
    html += '</div>';

    html += '<p class="result__note">' + t('wizard.result.note') + '</p>';
    html +=
      '<div class="result__restart">' +
      '<button type="button" class="btn btn--ghost" id="wizard-restart">' +
      '<span data-icon="refresh" class="icon-sm"></span><span>' +
      t('wizard.result.newQuote') +
      '</span></button>' +
      '</div>';

    els.resultView.innerHTML = html;
    if (window.Icons) Icons.render(els.resultView);
    els.resultView
      .querySelector('#wizard-restart')
      .addEventListener('click', restart);
  }

  function submit() {
    if (!validateStep(2)) return;
    lastResult = { quotes: buildQuotes(Number(state.weight), state.cargoType) };
    renderResult();
    els.formView.hidden = true;
    els.resultView.hidden = false;
    window.scrollTo(0, 0);
  }

  function restart() {
    state.origin = null;
    state.destination = null;
    state.cargoType = '';
    state.weight = '';
    state.unitType = '';
    state.containerType = '';
    state.special = '';
    state.email = '';
    state.phone = '';
    state.date = '';
    errors = {};
    lastResult = null;

    // Reset inputs/selects/textarea.
    els.form.querySelectorAll('[data-model]').forEach(function (el) {
      el.value = '';
    });
    if (els.cargoSelect) els.cargoSelect.value = '';
    setCargoType('');
    comboboxes.forEach(function (c) {
      c.refresh();
    });
    els.form
      .querySelectorAll('.has-error')
      .forEach(function (el) {
        el.classList.remove('has-error');
      });
    els.form.querySelectorAll('[data-error]').forEach(function (el) {
      el.textContent = '';
    });

    els.resultView.hidden = true;
    els.resultView.innerHTML = '';
    els.formView.hidden = false;
    showStep(0);
    window.scrollTo(0, 0);
  }

  /* ------------------------------- init ---------------------------- */
  function init() {
    els.formView = document.getElementById('wizard-form-view');
    els.resultView = document.getElementById('wizard-result-view');
    els.form = document.getElementById('wizard-form');
    els.stepper = document.getElementById('wizard-stepper');
    els.back = document.getElementById('wizard-back');
    els.next = document.getElementById('wizard-next');
    els.submit = document.getElementById('wizard-submit');
    els.cargoSelect = els.form.querySelector('[data-cargo-select]');
    if (!els.form) return;

    // Comboboxes
    els.form.querySelectorAll('[data-combobox]').forEach(function (c) {
      comboboxes.push(createCombobox(c));
    });

    // Cargo cards + select sync
    els.form.querySelectorAll('[data-cargo]').forEach(function (card) {
      card.addEventListener('click', function () {
        setCargoType(card.getAttribute('data-cargo'));
      });
    });
    if (els.cargoSelect) {
      els.cargoSelect.addEventListener('change', function () {
        setCargoType(els.cargoSelect.value);
      });
    }

    // Bind text inputs / selects / textarea via [data-model]
    els.form.querySelectorAll('[data-model]').forEach(function (el) {
      var field = el.getAttribute('data-model');
      var evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, function () {
        state[field] = el.value;
        if (errors[field]) setError(field, null);
      });
    });

    // Navigation
    els.back.addEventListener('click', function () {
      if (state.step === 0) {
        window.location.href = 'quote-start.html';
      } else {
        showStep(state.step - 1);
      }
    });
    els.next.addEventListener('click', function () {
      if (validateStep(state.step)) showStep(state.step + 1);
    });
    els.form.addEventListener('submit', function (e) {
      // The submit button lives in the form on every step, so an Enter keypress
      // on steps 1-2 lands here too. Treat that as "advance", not "submit".
      e.preventDefault();
      if (state.step < TOTAL - 1) {
        if (validateStep(state.step)) showStep(state.step + 1);
      } else {
        submit();
      }
    });

    showStep(0);
  }

  function onLangChange() {
    // The wizard only initialises on the quote-wizard page. On every other page the
    // language toggle still fires silah:langchange, so bail out before touching the
    // (unbuilt) wizard DOM to avoid throwing.
    if (!els.next) return;
    // Static labels/placeholders are handled globally by I18n.apply().
    applyAllErrors();
    renderNav();
    renderStepper();
    comboboxes.forEach(function (c) {
      c.refresh();
    });
    if (lastResult && !els.resultView.hidden) renderResult();
  }

  window.Wizard = { init: init, onLangChange: onLangChange };
})();
