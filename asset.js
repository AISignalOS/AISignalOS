/**
 * AISolutionsOS — asset.js
 * Renders a single library asset detail page from ?id=, with a working
 * copy button, related assets, and a Build Studio save (localStorage).
 */
(function () {
  'use strict';

  var AISO = window.AISO || {};
  var icons = AISO.icons || {};
  var SAVE_KEY = 'aiso_saved_assets';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      var m = window.location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    }
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var y = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(mo) || isNaN(d) || mo < 1 || mo > 12) return iso;
    return months[mo - 1] + ' ' + d + ', ' + y;
  }

  var COMPAT_NAME = { claude: 'Claude', gpt: 'GPT', gemini: 'Gemini' };
  function compatText(compat) {
    if (!compat || !compat.length) return '—';
    return compat.map(function (c) { return COMPAT_NAME[c] || c; }).join(', ');
  }

  /* ── localStorage save helpers ── */
  function getSaved() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }
  function isSaved(id) {
    return getSaved().indexOf(id) !== -1;
  }
  function saveAsset(id) {
    var arr = getSaved();
    if (arr.indexOf(id) === -1) {
      arr.push(id);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(arr)); } catch (e) {}
    }
  }

  /* ── copy helper ── */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function block(title, body) {
    if (!body) return '';
    return '<div class="asset-block"><h2>' + esc(title) + '</h2><p>' + esc(body) + '</p></div>';
  }

  function codeBlock(title, content, withCopy) {
    if (!content) return '';
    var copy = withCopy
      ? '<button class="copy-btn" data-copy-content type="button">Copy</button>'
      : '';
    return '<div class="asset-block"><h2>' + esc(title) + '</h2>' +
      '<div class="code-block">' + copy + '<pre>' + esc(content) + '</pre></div></div>';
  }

  function relatedHtml(asset, library) {
    var related = library.filter(function (a) {
      return a.id !== asset.id && (a.type === asset.type || a.useCase === asset.useCase);
    }).slice(0, 3);
    if (!related.length) return '';

    var cards = related.map(function (a) {
      return '<a class="library-card is-link" href="asset.html?id=' + encodeURIComponent(a.id) + '">' +
        '<span class="lib-type-badge badge-' + esc(a.type) + '">' + esc(a.typeLabel) + '</span>' +
        '<h3 class="lib-title">' + esc(a.title) + '</h3>' +
        '<p class="lib-desc">' + esc(a.desc) + '</p>' +
      '</a>';
    }).join('');

    return '<div class="asset-block"><h2>Related assets</h2>' +
      '<div class="library-grid cols-3" style="margin-bottom: 0;">' + cards + '</div></div>';
  }

  function renderNotFound(root, breadcrumb) {
    if (breadcrumb) {
      breadcrumb.innerHTML =
        '<a href="index.html">Home</a><span class="sep">/</span>' +
        '<a href="library.html">AI Library</a><span class="sep">/</span>' +
        '<span class="current">Not found</span>';
    }
    if (root) {
      root.innerHTML =
        '<div class="empty-state">' +
          '<h3>Asset not found</h3>' +
          '<p>We couldn\'t find the asset you were looking for. It may have moved or been renamed.</p>' +
          '<div class="hero-ctas" style="margin-top: 1.5rem;">' +
            '<a href="library.html" class="btn-primary btn-lg">Back to the AI Library</a>' +
          '</div>' +
        '</div>';
    }
  }

  function render(asset, root, breadcrumb) {
    document.title = asset.title + ' — AISolutionsOS';

    if (breadcrumb) {
      var back = icons.arrowLeft || '';
      breadcrumb.innerHTML =
        '<a href="index.html">Home</a><span class="sep">/</span>' +
        '<a href="library.html">' + back + ' AI Library</a><span class="sep">/</span>' +
        '<span class="current">' + esc(asset.title) + '</span>';
    }

    var priceLabel = asset.free ? 'Free' : 'Paid';
    var statusLabel = asset.status === 'tested' ? 'Tested' : 'Draft';
    var library = AISO.library || [];

    var main = '<div class="asset-main">' +
      '<div class="asset-header">' +
        '<span class="lib-type-badge badge-' + esc(asset.type) + '">' + esc(asset.typeLabel) + '</span>' +
        '<h1>' + esc(asset.title) + '</h1>' +
        '<p class="asset-tagline">' + esc(asset.desc) + '</p>' +
      '</div>' +
      block('What it is', asset.desc) +
      block("Who it's for", asset.forWho) +
      block('The problem it solves', asset.problem) +
      block('Inputs needed', asset.inputs) +
      block('What you get', asset.output) +
      block('Setup & install', asset.setup) +
      codeBlock('Example', asset.example, false) +
      codeBlock('The asset', asset.content, true) +
      relatedHtml(asset, library) +
    '</div>';

    var sidebar = '<aside class="asset-sidebar">' +
      '<ul class="meta-list">' +
        '<li class="meta-item"><span class="meta-key">Type</span><span class="meta-val">' + esc(asset.typeLabel) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Status</span><span class="meta-val">' + esc(statusLabel) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Price</span><span class="meta-val">' + esc(priceLabel) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Difficulty</span><span class="meta-val">' + esc(asset.difficulty) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Use case</span><span class="meta-val">' + esc(asset.useCase) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Version</span><span class="meta-val">' + esc(asset.version) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Last updated</span><span class="meta-val">' + esc(formatDate(asset.updated)) + '</span></li>' +
        '<li class="meta-item"><span class="meta-key">Compatibility</span><span class="meta-val">' + esc(compatText(asset.compat)) + '</span></li>' +
      '</ul>' +
      '<button class="btn-primary btn-full" data-copy-content type="button">Copy / Download</button>' +
      '<hr />' +
      '<button class="btn-outline btn-full" id="save-btn" type="button">Save to Build Studio</button>' +
    '</aside>';

    root.innerHTML = '<div class="asset-layout">' + main + sidebar + '</div>';

    // Wire copy buttons (code block + sidebar)
    var copyBtns = root.querySelectorAll('[data-copy-content]');
    Array.prototype.forEach.call(copyBtns, function (btn) {
      var original = btn.textContent;
      btn.addEventListener('click', function () {
        copyText(asset.content || '').then(function () {
          btn.classList.add('copied');
          btn.textContent = 'Copied!';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.textContent = original;
          }, 1500);
        }).catch(function () {
          btn.textContent = 'Copy failed';
          setTimeout(function () { btn.textContent = original; }, 1500);
        });
      });
    });

    // Wire save button
    var saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      if (isSaved(asset.id)) {
        saveBtn.classList.add('saved');
        saveBtn.textContent = 'Saved ✓';
      }
      saveBtn.addEventListener('click', function () {
        saveAsset(asset.id);
        saveBtn.classList.add('saved');
        saveBtn.textContent = 'Saved ✓';
      });
    }
  }

  function init() {
    var root = document.getElementById('asset-root');
    var breadcrumb = document.getElementById('asset-breadcrumb');
    if (!root) return;

    var id = getParam('id');
    var asset = id && typeof AISO.getAsset === 'function' ? AISO.getAsset(id) : null;

    if (!asset) {
      renderNotFound(root, breadcrumb);
      return;
    }
    render(asset, root, breadcrumb);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
