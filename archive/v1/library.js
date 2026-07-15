/**
 * AISolutionsOS — library.js
 * Renders the full searchable AI asset library from window.AISO.library,
 * with live text search + single-select multi-group pill filters.
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

  var COMPAT_LABEL = { claude: 'C', gpt: 'G', gemini: 'Gm' };

  function compatHtml(compat) {
    return (compat || []).map(function (c) {
      var cls = 'compat-' + c;
      var label = COMPAT_LABEL[c] || '?';
      var title = c.charAt(0).toUpperCase() + c.slice(1);
      return '<span class="compat-icon ' + cls + '" title="' + esc(title) + '">' + esc(label) + '</span>';
    }).join('');
  }

  function cardHtml(asset) {
    var searchText = [asset.title, asset.desc, asset.type, asset.typeLabel, asset.useCase]
      .join(' ').toLowerCase();
    var priceVal = asset.free ? 'free' : 'paid';
    var priceChip = asset.free
      ? '<span class="chip chip-free">Free</span>'
      : '<span class="chip chip-paid">Paid</span>';

    return '' +
      '<a class="library-card is-link reveal-card" href="asset.html?id=' + encodeURIComponent(asset.id) + '"' +
        ' data-category="' + esc(asset.type) + '"' +
        ' data-status="' + esc(asset.status) + '"' +
        ' data-free="' + priceVal + '"' +
        ' data-difficulty="' + esc(asset.difficulty) + '"' +
        ' data-usecase="' + esc(asset.useCase) + '"' +
        ' data-text="' + esc(searchText) + '">' +
        '<span class="lib-type-badge badge-' + esc(asset.type) + '">' + esc(asset.typeLabel) + '</span>' +
        '<h3 class="lib-title">' + esc(asset.title) + '</h3>' +
        '<p class="lib-desc">' + esc(asset.desc) + '</p>' +
        '<div class="lib-meta-row">' +
          priceChip +
          '<span class="chip chip-difficulty">' + esc(asset.difficulty) + '</span>' +
          '<span class="chip">' + esc(asset.useCase) + '</span>' +
        '</div>' +
        '<div class="lib-footer">' +
          '<div class="lib-compat">' + compatHtml(asset.compat) + '</div>' +
          '<span class="lib-status badge-' + esc(asset.status) + '">' + esc(asset.status) + '</span>' +
        '</div>' +
      '</a>';
  }

  function init() {
    var grid = document.getElementById('lib-grid');
    var empty = document.getElementById('lib-empty');
    var countEl = document.getElementById('lib-result-count');
    var searchEl = document.getElementById('lib-search');
    var searchIcon = document.getElementById('lib-search-icon');
    if (!grid) return;

    if (searchIcon && icons.search) searchIcon.innerHTML = icons.search;

    // Initial render
    grid.innerHTML = library.map(cardHtml).join('');
    if (typeof AISO.observeReveals === 'function') AISO.observeReveals();

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.library-card'));

    // Active filter state (single-select per group, default "all")
    var filters = { type: 'all', difficulty: 'all', price: 'all' };

    function apply() {
      var q = (searchEl && searchEl.value ? searchEl.value : '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var matchText = !q || (card.getAttribute('data-text') || '').indexOf(q) !== -1;
        var matchType = filters.type === 'all' || card.getAttribute('data-category') === filters.type;
        var matchDiff = filters.difficulty === 'all' || card.getAttribute('data-difficulty') === filters.difficulty;
        var matchPrice = filters.price === 'all' || card.getAttribute('data-free') === filters.price;
        var show = matchText && matchType && matchDiff && matchPrice;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visible + ' asset' + (visible === 1 ? '' : 's');
      }
      if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
    }

    // Wire pill groups
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

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
