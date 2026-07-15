/**
 * AISolutionsOS — library.js
 * Renders the full searchable AI asset library from window.AISO.library,
 * with live text search + multi-group pill filters (all groups AND together).
 */
(function () {
  'use strict';

  var AISO = window.AISO || {};
  var library = AISO.library || [];
  var icons = AISO.icons || {};

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var COMPAT_LABEL = {
    claude: 'C',
    gpt: 'G',
    gemini: 'Gm',
    codex: 'Cx',
    antigravity: 'Ag',
    cursor: 'Cu',
    github: 'Gh',
    vercel: 'Ve',
    notion: 'No',
    google: 'Go',
    n8n: 'n8',
    zapier: 'Za',
    make: 'Mk',
    airtable: 'At',
    supabase: 'Sb'
  };

  var LICENSE_LABEL = {
    personal: 'Personal use',
    commercial: 'Commercial OK'
  };

  // Types/statuses that already have dedicated color classes in styles.css.
  // Anything outside these sets gets a generated fallback color so new
  // contract values (added by data.js over time) still render cleanly.
  var KNOWN_TYPE_BADGES = { prompt: 1, mcp: 1, skill: 1, checklist: 1, template: 1, cli: 1, automation: 1 };
  var KNOWN_STATUS_BADGES = { tested: 1, draft: 1 };

  var FALLBACK_PALETTE = [
    { bg: 'rgba(79,142,247,0.12)', bd: 'rgba(79,142,247,0.25)', fg: '#4f8ef7' },
    { bg: 'rgba(139,92,246,0.12)', bd: 'rgba(139,92,246,0.25)', fg: '#a78bfa' },
    { bg: 'rgba(6,182,212,0.12)', bd: 'rgba(6,182,212,0.25)', fg: '#22d3ee' },
    { bg: 'rgba(34,197,94,0.12)', bd: 'rgba(34,197,94,0.25)', fg: '#4ade80' },
    { bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.25)', fg: '#fbbf24' },
    { bg: 'rgba(239,68,68,0.12)', bd: 'rgba(239,68,68,0.25)', fg: '#f87171' }
  ];

  function fallbackChipStyle(knownSet, value) {
    if (!value || knownSet[value]) return '';
    var hash = 0;
    for (var i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    var c = FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
    return ' style="background:' + c.bg + ';border:1px solid ' + c.bd + ';color:' + c.fg + ';"';
  }

  function compatHtml(compat) {
    return (compat || []).map(function (c) {
      var cls = 'compat-' + c;
      var label = COMPAT_LABEL[c] || c.slice(0, 2).toUpperCase();
      var title = c.charAt(0).toUpperCase() + c.slice(1);
      return '<span class="compat-icon ' + cls + '" title="' + esc(title) + '">' + esc(label) + '</span>';
    }).join('');
  }

  function cardHtml(asset) {
    var compat = asset.compat || [];
    var searchText = [
      asset.title, asset.desc, asset.type, asset.typeLabel, asset.useCase,
      asset.status, asset.license, compat.join(' ')
    ].join(' ').toLowerCase();
    var priceVal = asset.free ? 'free' : 'paid';
    var priceChip = asset.free
      ? '<span class="chip chip-free">Free</span>'
      : '<span class="chip chip-paid">Paid</span>';
    var licenseLabel = LICENSE_LABEL[asset.license] || '';
    var licenseTag = licenseLabel
      ? '<span class="lib-license-tag">' + esc(licenseLabel) + '</span>'
      : '';

    return '' +
      '<a class="library-card is-link reveal-card" href="asset.html?id=' + encodeURIComponent(asset.id) + '"' +
        ' data-category="' + esc(asset.type) + '"' +
        ' data-status="' + esc(asset.status) + '"' +
        ' data-free="' + priceVal + '"' +
        ' data-difficulty="' + esc(asset.difficulty) + '"' +
        ' data-usecase="' + esc(asset.useCase) + '"' +
        ' data-license="' + esc(asset.license) + '"' +
        ' data-compat="' + esc(compat.join(' ')) + '"' +
        ' data-text="' + esc(searchText) + '">' +
        '<span class="lib-type-badge badge-' + esc(asset.type) + '"' + fallbackChipStyle(KNOWN_TYPE_BADGES, asset.type) + '>' + esc(asset.typeLabel) + '</span>' +
        '<h3 class="lib-title">' + esc(asset.title) + '</h3>' +
        '<p class="lib-desc">' + esc(asset.desc) + '</p>' +
        '<div class="lib-meta-row">' +
          priceChip +
          '<span class="chip chip-difficulty">' + esc(asset.difficulty) + '</span>' +
          '<span class="chip">' + esc(asset.useCase) + '</span>' +
        '</div>' +
        '<div class="lib-footer">' +
          '<div class="lib-footer-left">' +
            '<div class="lib-compat">' + compatHtml(compat) + '</div>' +
            licenseTag +
          '</div>' +
          '<span class="lib-status badge-' + esc(asset.status) + '"' + fallbackChipStyle(KNOWN_STATUS_BADGES, asset.status) + '>' + esc(asset.status) + '</span>' +
        '</div>' +
      '</a>';
  }

  // Builds the TYPE pill row from the distinct types present in the data,
  // keeping the static "All" pill first.
  function renderTypePills(group) {
    if (!group) return;
    var seen = {};
    var types = [];
    library.forEach(function (asset) {
      if (!asset || !asset.type || seen[asset.type]) return;
      seen[asset.type] = true;
      types.push({ value: asset.type, label: asset.typeLabel || asset.type });
    });
    types.sort(function (a, b) {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });

    var html = '<span class="filter-label">Type</span><button class="filter-pill active" data-value="all">All</button>';
    types.forEach(function (t) {
      html += '<button class="filter-pill" data-value="' + esc(t.value) + '">' + esc(t.label) + '</button>';
    });
    group.innerHTML = html;
  }

  function init() {
    var grid = document.getElementById('lib-grid');
    var empty = document.getElementById('lib-empty');
    var countEl = document.getElementById('lib-result-count');
    var searchEl = document.getElementById('lib-search');
    var searchIcon = document.getElementById('lib-search-icon');
    var typeGroup = document.getElementById('lib-filter-type');
    var resetBtn = document.getElementById('lib-reset');
    if (!grid) return;

    if (searchIcon && icons.search) searchIcon.innerHTML = icons.search;

    renderTypePills(typeGroup);

    // Initial render
    grid.innerHTML = library.map(cardHtml).join('');
    if (typeof AISO.observeReveals === 'function') AISO.observeReveals();

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.library-card'));

    // Active filter state (single-select per group, default "all"); all groups AND together.
    var filters = {
      type: 'all',
      difficulty: 'all',
      price: 'all',
      tool: 'all',
      usecase: 'all',
      status: 'all',
      license: 'all'
    };

    function hasCompat(card, value) {
      var raw = card.getAttribute('data-compat') || '';
      if (!raw) return false;
      var list = raw.split(' ');
      return list.indexOf(value) !== -1;
    }

    function apply() {
      var q = (searchEl && searchEl.value ? searchEl.value : '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var matchText = !q || (card.getAttribute('data-text') || '').indexOf(q) !== -1;
        var matchType = filters.type === 'all' || card.getAttribute('data-category') === filters.type;
        var matchDiff = filters.difficulty === 'all' || card.getAttribute('data-difficulty') === filters.difficulty;
        var matchPrice = filters.price === 'all' || card.getAttribute('data-free') === filters.price;
        var matchTool = filters.tool === 'all' || hasCompat(card, filters.tool);
        var matchUseCase = filters.usecase === 'all' || card.getAttribute('data-usecase') === filters.usecase;
        var matchStatus = filters.status === 'all' || card.getAttribute('data-status') === filters.status;
        var matchLicense = filters.license === 'all' || card.getAttribute('data-license') === filters.license;
        var show = matchText && matchType && matchDiff && matchPrice && matchTool && matchUseCase && matchStatus && matchLicense;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visible + ' asset' + (visible === 1 ? '' : 's');
      }
      if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    }

    // Wire pill groups (event delegation on each group's container, so this
    // also works for the dynamically-generated Type pills above).
    var groups = document.querySelectorAll('[data-filter-group]');
    Array.prototype.forEach.call(groups, function (group) {
      var name = group.getAttribute('data-filter-group');
      group.addEventListener('click', function (e) {
        var pill = e.target.closest ? e.target.closest('.filter-pill') : null;
        if (!pill || !group.contains(pill)) return;
        var pills = group.querySelectorAll('.filter-pill');
        Array.prototype.forEach.call(pills, function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        filters[name] = pill.getAttribute('data-value') || 'all';
        apply();
      });
    });

    if (searchEl) {
      searchEl.addEventListener('input', apply);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        Object.keys(filters).forEach(function (name) { filters[name] = 'all'; });
        Array.prototype.forEach.call(groups, function (group) {
          var pills = group.querySelectorAll('.filter-pill');
          Array.prototype.forEach.call(pills, function (p) {
            p.classList.toggle('active', p.getAttribute('data-value') === 'all');
          });
        });
        apply();
      });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
