/**
 * AISolutionsOS — glossary.js
 * Renders AISO.glossary into a grid and live-filters cards by a search box
 * that matches term, full name, or definition. Shows an empty state when
 * nothing matches.
 * Requires data.js + shared.js (window.AISO).
 */
(function () {
  'use strict';

  var AISO = window.AISO;
  if (!AISO) return;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var cards = [];

  function cardMarkup(item) {
    return '' +
      '<div class="glossary-card">' +
        '<div class="glossary-term">' +
          '<span class="g-abbr">' + esc(item.term) + '</span>' +
          (item.full && item.full !== item.term
            ? '<span class="g-full">' + esc(item.full) + '</span>'
            : '') +
        '</div>' +
        '<p class="glossary-def">' + esc(item.def) + '</p>' +
      '</div>';
  }

  function applyFilter(query) {
    var q = (query || '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (entry) {
      var match = !q || entry.haystack.indexOf(q) !== -1;
      entry.el.classList.toggle('hidden', !match);
      if (match) visible++;
    });

    var empty = document.getElementById('glossary-empty');
    if (empty) {
      empty.innerHTML = visible === 0
        ? '<div class="empty-state"><h3>No matches</h3>' +
          '<p>No terms match "' + esc(query) + '". Try a different word.</p></div>'
        : '';
    }
  }

  function init() {
    var grid = document.getElementById('glossary-grid');
    var input = document.getElementById('glossary-search');
    var icon = document.getElementById('glossary-search-icon');
    if (!grid) return;

    if (icon && AISO.icons && AISO.icons.search) icon.innerHTML = AISO.icons.search;

    var items = AISO.glossary || [];
    if (!items.length) {
      grid.innerHTML = '';
      var empty = document.getElementById('glossary-empty');
      if (empty) {
        empty.innerHTML =
          '<div class="empty-state"><h3>No terms yet</h3>' +
          '<p>The glossary is empty for now.</p></div>';
      }
      return;
    }

    grid.innerHTML = items.map(cardMarkup).join('');

    var cardEls = grid.querySelectorAll('.glossary-card');
    cards = items.map(function (item, i) {
      return {
        el: cardEls[i],
        haystack: ((item.term || '') + ' ' + (item.full || '') + ' ' + (item.def || '')).toLowerCase()
      };
    });

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
