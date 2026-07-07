/**
 * AISolutionsOS — changelog.js
 * Renders AISO.changelog (newest-first) as a vertical timeline.
 * Requires data.js + shared.js (window.AISO).
 */
(function () {
  'use strict';

  var AISO = window.AISO;
  if (!AISO) return;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12) return iso;
    return MONTHS[m - 1] + ' ' + d + ', ' + y;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function entryMarkup(entry) {
    var type = entry.type === 'updated' ? 'updated' : 'added';
    var typeLabel = type === 'updated' ? 'Updated' : 'Added';
    var items = (entry.items || []).map(function (it) {
      return '<li>' + esc(it) + '</li>';
    }).join('');

    return '' +
      '<div class="timeline-entry type-' + type + ' reveal-card">' +
        '<div class="cl-head">' +
          '<span class="cl-version">' + esc(entry.version) + '</span>' +
          '<span class="cl-date">' + esc(formatDate(entry.date)) + '</span>' +
          '<span class="cl-type ' + type + '">' + typeLabel + '</span>' +
        '</div>' +
        '<h2 class="cl-title">' + esc(entry.title) + '</h2>' +
        '<ul class="cl-items">' + items + '</ul>' +
      '</div>';
  }

  function init() {
    var host = document.getElementById('changelog-timeline');
    if (!host) return;

    var entries = AISO.changelog || [];
    if (!entries.length) {
      host.innerHTML =
        '<div class="empty-state"><h3>Nothing logged yet</h3>' +
        '<p>Changes will show up here as they ship.</p></div>';
      return;
    }

    host.innerHTML = entries.map(entryMarkup).join('');
    if (AISO.observeReveals) AISO.observeReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
