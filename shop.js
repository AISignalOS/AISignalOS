/**
 * AISolutionsOS — shop.js
 * Renders products from window.AISO.products and runs a working
 * localStorage-backed cart (key: aiso_cart, an array of product ids;
 * quantity is represented by repeated ids).
 */
(function () {
  'use strict';

  var AISO = window.AISO || {};
  var products = AISO.products || [];
  var STORAGE_KEY = 'aiso_cart';

  /* ─── Storage helpers ─────────────────────────────────── */
  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) { /* ignore quota / private mode */ }
  }

  /* ─── Render product grid ─────────────────────────────── */
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderProducts() {
    var grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = '<div class="empty-state"><h3>No products yet</h3><p>Check back soon.</p></div>';
      return;
    }

    grid.innerHTML = products.map(function (p) {
      var badge = p.badge
        ? '<span class="product-badge">' + escapeHtml(p.badge) + '</span>'
        : '';
      var features = (p.features || []).map(function (f) {
        return '<li>' + escapeHtml(f) + '</li>';
      }).join('');
      return '' +
        '<article class="product-card reveal-card">' +
          badge +
          '<span class="product-kind">' + escapeHtml(p.kind) + '</span>' +
          '<h3 class="product-title">' + escapeHtml(p.title) + '</h3>' +
          '<p class="product-desc">' + escapeHtml(p.desc) + '</p>' +
          '<ul class="product-features">' + features + '</ul>' +
          '<div class="product-foot">' +
            '<span class="product-price">$' + Number(p.price) + ' <span>one-time</span></span>' +
            '<button class="btn-primary btn-sm" data-id="' + escapeHtml(p.id) + '">Add to Cart</button>' +
          '</div>' +
        '</article>';
    }).join('');

    if (typeof AISO.observeReveals === 'function') AISO.observeReveals();
  }

  /* ─── Cart rendering ──────────────────────────────────── */
  var els = {};

  function cartTotals(ids) {
    return ids.reduce(function (sum, id) {
      var p = AISO.getProduct ? AISO.getProduct(id) : null;
      return sum + (p ? Number(p.price) : 0);
    }, 0);
  }

  function renderCart() {
    var ids = readCart();

    // Count
    if (els.count) els.count.textContent = String(ids.length);

    // Items grouped by id with quantities
    if (els.items) {
      if (!ids.length) {
        els.items.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        if (els.foot) els.foot.style.display = 'none';
      } else {
        if (els.foot) els.foot.style.display = '';
        var groups = {};
        var order = [];
        ids.forEach(function (id) {
          if (!groups[id]) { groups[id] = 0; order.push(id); }
          groups[id]++;
        });
        els.items.innerHTML = order.map(function (id) {
          var p = AISO.getProduct ? AISO.getProduct(id) : null;
          if (!p) return '';
          var qty = groups[id];
          var line = Number(p.price) * qty;
          var qtyLabel = qty > 1 ? ' &times;' + qty : '';
          return '' +
            '<div class="cart-item">' +
              '<div>' +
                '<div class="ci-title">' + escapeHtml(p.title) + qtyLabel + '</div>' +
                '<div class="ci-price">$' + line + '</div>' +
              '</div>' +
              '<button class="ci-remove" data-remove="' + escapeHtml(id) + '">Remove</button>' +
            '</div>';
        }).join('');
      }
    }

    if (els.total) els.total.textContent = '$' + cartTotals(ids);
  }

  /* ─── Cart mutations ──────────────────────────────────── */
  function addToCart(id) {
    if (!id) return;
    if (AISO.getProduct && !AISO.getProduct(id)) return;
    var ids = readCart();
    ids.push(id);
    writeCart(ids);
    renderCart();
    openDrawer();
  }

  function removeOne(id) {
    var ids = readCart();
    var idx = ids.indexOf(id);
    if (idx !== -1) ids.splice(idx, 1);
    writeCart(ids);
    renderCart();
  }

  /* ─── Drawer open/close ───────────────────────────────── */
  function openDrawer() {
    if (els.drawer) els.drawer.classList.add('open');
    if (els.overlay) els.overlay.classList.add('open');
  }
  function closeDrawer() {
    if (els.drawer) els.drawer.classList.remove('open');
    if (els.overlay) els.overlay.classList.remove('open');
  }

  /* ─── Wiring ──────────────────────────────────────────── */
  function init() {
    els.count = document.getElementById('cart-count');
    els.items = document.getElementById('cart-items');
    els.total = document.getElementById('cart-total');
    els.foot = document.getElementById('cart-foot');
    els.drawer = document.getElementById('cart-drawer');
    els.overlay = document.getElementById('cart-overlay');

    renderProducts();
    renderCart();

    // Add to cart (event delegation on grid)
    var grid = document.getElementById('product-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-id]');
        if (btn) addToCart(btn.getAttribute('data-id'));
      });
    }

    // Remove from cart (delegation on items list)
    if (els.items) {
      els.items.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove]');
        if (btn) removeOne(btn.getAttribute('data-remove'));
      });
    }

    var fab = document.getElementById('cart-fab');
    if (fab) fab.addEventListener('click', openDrawer);

    var close = document.getElementById('cart-close');
    if (close) close.addEventListener('click', closeDrawer);

    if (els.overlay) els.overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    var checkout = document.getElementById('cart-checkout');
    if (checkout) {
      checkout.addEventListener('click', function () {
        if (!readCart().length) return;
        alert('Checkout is a prototype — payments coming soon.');
      });
    }

    // Sync across tabs
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) renderCart();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
