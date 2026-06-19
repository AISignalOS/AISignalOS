/**
 * AISolutionsOS — blog.js
 * Renders the Build Log: tag filter pills, a featured most-recent post,
 * and a grid of the remaining posts. Filtering is single-select by tag.
 * Requires data.js + shared.js (window.AISO).
 */
(function () {
  'use strict';

  var AISO = window.AISO;
  if (!AISO) return;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var ARROW_RIGHT =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
    '<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

  var FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'build-log', label: 'Build Log' },
    { key: 'tutorial', label: 'Tutorial' },
    { key: 'deep-dive', label: 'Deep Dive' },
    { key: 'tested', label: 'I Tested This' }
  ];

  function sortedPosts() {
    var posts = (AISO.posts || []).slice();
    posts.sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
    return posts;
  }

  function cardMarkup(post, opts) {
    opts = opts || {};
    var featuredCls = opts.featured ? ' featured' : '';
    return '' +
      '<a class="blog-card' + featuredCls + ' reveal-card" data-tag="' + esc(post.tag) + '" ' +
        'href="post.html?slug=' + encodeURIComponent(post.slug) + '">' +
        '<div class="blog-card-inner">' +
          '<span class="blog-tag tag-' + esc(post.tag) + '">' + esc(post.tagLabel) + '</span>' +
          '<h3 class="blog-title">' + esc(post.title) + '</h3>' +
          '<p class="blog-excerpt">' + esc(post.excerpt) + '</p>' +
          '<div class="blog-footer">' +
            '<span class="blog-date">' + esc(formatDate(post.date)) + '</span>' +
            '<span class="blog-read-time">' + esc(post.readTime) + '</span>' +
          '</div>' +
          '<span class="blog-read-link">Read ' + ARROW_RIGHT + '</span>' +
        '</div>' +
      '</a>';
  }

  function render(activeFilter) {
    var featuredHost = document.getElementById('blog-featured-host');
    var grid = document.getElementById('blog-grid');
    var empty = document.getElementById('blog-empty');
    if (!grid) return;

    var posts = sortedPosts();
    var filtered = activeFilter === 'all'
      ? posts
      : posts.filter(function (p) { return p.tag === activeFilter; });

    featuredHost.innerHTML = '';
    grid.innerHTML = '';
    if (empty) empty.innerHTML = '';

    if (!filtered.length) {
      if (empty) {
        empty.innerHTML =
          '<div class="empty-state"><h3>No posts here yet</h3>' +
          '<p>Nothing tagged that way so far — try another filter.</p></div>';
      }
      return;
    }

    var rest = filtered;

    // Featured layout only makes sense with a handful of posts present.
    if (filtered.length >= 3) {
      var featured = filtered[0];
      var sideTwo = filtered.slice(1, 3);
      rest = filtered.slice(3);

      var sideMarkup = sideTwo.map(function (p) { return cardMarkup(p); }).join('');
      featuredHost.className = '';
      featuredHost.innerHTML =
        '<div class="blog-featured">' +
          cardMarkup(featured, { featured: true }) +
          '<div class="blog-featured-side" style="display:flex;flex-direction:column;gap:var(--space-lg);">' +
            sideMarkup +
          '</div>' +
        '</div>';
    }

    grid.innerHTML = rest.map(function (p) { return cardMarkup(p); }).join('');

    if (AISO.observeReveals) AISO.observeReveals();
  }

  function buildFilters() {
    var host = document.getElementById('blog-filters');
    if (!host) return 'all';

    host.innerHTML = FILTERS.map(function (f, i) {
      var active = i === 0 ? ' active' : '';
      return '<button type="button" class="filter-pill' + active + '" data-filter="' + f.key + '">' +
        esc(f.label) + '</button>';
    }).join('');

    host.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-pill');
      if (!btn) return;
      host.querySelectorAll('.filter-pill').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      render(btn.getAttribute('data-filter') || 'all');
    });

    return 'all';
  }

  function init() {
    var initial = buildFilters();
    render(initial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
