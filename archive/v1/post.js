/**
 * AISolutionsOS — post.js
 * Reads ?slug= and renders a single Build Log post: breadcrumb, header,
 * prose body, and a "More from the Build Log" section. Falls back to an
 * empty state for missing/unknown slugs.
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

  function getSlug() {
    try {
      return new URLSearchParams(window.location.search).get('slug');
    } catch (e) {
      var m = window.location.search.match(/[?&]slug=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }
  }

  function relatedCard(post) {
    return '' +
      '<a class="blog-card reveal-card" href="post.html?slug=' + encodeURIComponent(post.slug) + '">' +
        '<div class="blog-card-inner">' +
          '<span class="blog-tag tag-' + esc(post.tag) + '">' + esc(post.tagLabel) + '</span>' +
          '<h3 class="blog-title">' + esc(post.title) + '</h3>' +
          '<p class="blog-excerpt">' + esc(post.excerpt) + '</p>' +
          '<div class="blog-footer">' +
            '<span class="blog-date">' + esc(formatDate(post.date)) + '</span>' +
            '<span class="blog-read-time">' + esc(post.readTime) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  function renderEmpty(root, breadcrumb) {
    if (breadcrumb) {
      breadcrumb.innerHTML =
        '<a href="index.html">Home</a><span class="sep">/</span>' +
        '<a href="blog.html">Blog</a><span class="sep">/</span>' +
        '<span class="current">Not found</span>';
    }
    root.innerHTML =
      '<div class="empty-state">' +
        '<h3>Post not found</h3>' +
        '<p>We could not find that post. It may have moved or never existed.</p>' +
        '<p style="margin-top:var(--space-lg);"><a class="btn-primary" href="blog.html">' +
          AISO.icons.arrowLeft + ' Back to the Build Log</a></p>' +
      '</div>';
  }

  function renderPost(root, breadcrumb, post) {
    document.title = post.title + ' — AISolutionsOS';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt || post.title);

    if (breadcrumb) {
      breadcrumb.innerHTML =
        '<a href="index.html">Home</a><span class="sep">/</span>' +
        '<a href="blog.html">Blog</a><span class="sep">/</span>' +
        '<span class="current">' + esc(post.title) + '</span>';
    }

    var body = (post.body || []).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');

    var related = (AISO.posts || [])
      .filter(function (p) { return p.slug !== post.slug; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); })
      .slice(0, 3);

    var relatedSection = '';
    if (related.length) {
      relatedSection =
        '<section class="section" style="padding-bottom:0;margin-top:var(--space-2xl);">' +
          '<h2 class="cl-title" style="font-size:1.5rem;margin-bottom:var(--space-lg);text-align:center;">' +
            'More from the Build Log</h2>' +
          '<div class="blog-grid">' +
            related.map(relatedCard).join('') +
          '</div>' +
        '</section>';
    }

    root.innerHTML =
      '<article class="post-layout reveal-fade visible">' +
        '<div class="post-head">' +
          '<span class="blog-tag tag-' + esc(post.tag) + '">' + esc(post.tagLabel) + '</span>' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<div class="post-meta">' +
            '<span>' + esc(formatDate(post.date)) + '</span>' +
            '<span>·</span>' +
            '<span>' + esc(post.readTime) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="prose">' + body + '</div>' +
      '</article>' +
      relatedSection;

    if (AISO.observeReveals) AISO.observeReveals();
  }

  function init() {
    var root = document.getElementById('post-root');
    var breadcrumb = document.getElementById('post-breadcrumb');
    if (!root) return;

    var slug = getSlug();
    var post = slug ? AISO.getPost(slug) : null;

    if (!post) {
      renderEmpty(root, breadcrumb);
      return;
    }
    renderPost(root, breadcrumb, post);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
