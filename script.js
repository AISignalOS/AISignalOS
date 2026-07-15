/**
 * AISolutionsOS — script.js
 * Home-page-specific behavior only.
 * Shared logic (canvas, nav, reveals, smooth scroll, progress, count-up)
 * lives in shared.js.
 */

/* ============================================================
   HERO STAT COUNTS — derive from data (window.AISO) so the
   numbers stay in sync as data.js grows. Runs synchronously at
   parse time (before shared.js count-up reads the text).
   ============================================================ */
(function initHeroStatCounts() {
  if (!window.AISO) return;
  var stats = document.querySelectorAll('.hero-stats .stat');
  if (!stats.length) return;

  function setStat(label, count) {
    stats.forEach(function (s) {
      var l = s.querySelector('.stat-label');
      var n = s.querySelector('.stat-num');
      if (l && n && l.textContent.trim().toLowerCase() === label) {
        n.textContent = count + '+';
      }
    });
  }

  if (Array.isArray(window.AISO.tools))   setStat('ai tools', window.AISO.tools.length);
  if (Array.isArray(window.AISO.library)) setStat('library assets', window.AISO.library.length);
})();

/* ============================================================
   PIPELINE SECTION — SEQUENTIAL ANIMATION
   ============================================================ */
(function initPipeline() {
  var steps  = document.querySelectorAll('.pipeline-step');
  var arrows = document.querySelectorAll('.pipeline-arrow');
  if (!steps.length) return;

  var pipelineObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        steps.forEach(function (step, i) {
          setTimeout(function () { step.classList.add('visible'); }, i * 180);
        });
        arrows.forEach(function (arrow, i) {
          setTimeout(function () { arrow.classList.add('visible'); }, i * 180 + 90);
        });
        pipelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  var track = document.querySelector('.pipeline-track');
  if (track) pipelineObserver.observe(track);
})();

/* ============================================================
   LIBRARY CATEGORY FILTER (homepage preview)
   ============================================================ */
(function initLibraryFilter() {
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.library-card');
  if (!pills.length || !cards.length) return;

  cards.forEach(function (card) {
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  });

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var filter = pill.dataset.filter;

      cards.forEach(function (card, i) {
        var shouldShow = filter === 'all' || card.dataset.category === filter;
        if (!shouldShow) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.94) translateY(8px)';
          setTimeout(function () { card.classList.add('hidden'); }, 250);
        } else {
          card.classList.remove('hidden');
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          }, 20 + i * 50);
        }
      });
    });
  });
})();

/* ============================================================
   TOOL CARD GLOW ON HOVER (mouse tracking)
   ============================================================ */
(function initToolCardGlow() {
  document.querySelectorAll('.tool-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var glow = card.querySelector('.tool-glow');
      if (glow) {
        glow.style.background = 'radial-gradient(circle at ' + (e.clientX - rect.left) + 'px ' + (e.clientY - rect.top) + 'px, rgba(79,142,247,0.1) 0%, transparent 60%)';
      }
    });
    card.addEventListener('mouseleave', function () {
      var glow = card.querySelector('.tool-glow');
      if (glow) glow.style.background = 'radial-gradient(ellipse at top left, rgba(79,142,247,0.06) 0%, transparent 60%)';
    });
  });
})();

/* ============================================================
   PIPELINE ARROW PULSE STAGGER
   ============================================================ */
(function initArrowStagger() {
  document.querySelectorAll('.pipeline-arrow svg').forEach(function (arrow, i) {
    arrow.style.animationDelay = (i * 0.4) + 's';
  });
})();

/* ============================================================
   PIPELINE STEP INTERACTIVE HIGHLIGHT — hover + keyboard focus
   Highlights the active stage (via .step-active) and dims the
   rest, surfacing that stage's one-line description. Step cards
   are focusable (tabindex=0) so focus mirrors hover.
   ============================================================ */
(function initPipelineInteraction() {
  var steps = document.querySelectorAll('.pipeline-step');
  if (!steps.length) return;

  function activate(activeStep) {
    steps.forEach(function (s) {
      var c = s.querySelector('.step-card');
      if (s === activeStep) {
        s.classList.add('step-active');
        if (c) c.style.opacity = '1';
      } else {
        s.classList.remove('step-active');
        if (c) { c.style.opacity = '0.5'; c.style.transition = 'opacity 0.2s ease'; }
      }
    });
  }

  function clearAll() {
    steps.forEach(function (s) {
      s.classList.remove('step-active');
      var c = s.querySelector('.step-card');
      if (c) c.style.opacity = '1';
    });
  }

  steps.forEach(function (step) {
    var card = step.querySelector('.step-card');
    if (!card) return;
    card.addEventListener('mouseenter', function () { activate(step); });
    card.addEventListener('mouseleave', clearAll);
    card.addEventListener('focus', function () { activate(step); });
    card.addEventListener('blur', clearAll);
  });
})();

/* ============================================================
   CUSTOM CURSOR — dot + eased trailing ring (rAF, transform-only)
   Disabled on touch / coarse pointers and prefers-reduced-motion.
   Never blocks clicks (pointer-events: none via CSS).
   ============================================================ */
(function initCustomCursor() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(pointer: fine)').matches &&
               window.matchMedia('(hover: hover)').matches;
  if (reduce || !fine) return;

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('cursor-active');

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var rx = mx, ry = my;

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = 'translate(' + mx + 'px,' + my + 'px)';
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  // Grow/brighten ring over interactive targets — delegation covers
  // nav/footer that shared.js injects after this runs.
  var hoverSel = 'a, button, .tool-card, .library-card, .blog-card, .step-card, .filter-pill, [role="button"]';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('cursor-hover');
  }, { passive: true });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(hoverSel)) {
      var to = e.relatedTarget;
      if (!to || !(to.closest && to.closest(hoverSel))) ring.classList.remove('cursor-hover');
    }
  }, { passive: true });

  // Fade out when the pointer leaves the window.
  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity = ''; ring.style.opacity = '';
  });
})();

/* ============================================================
   MAGNETIC HERO CTA BUTTONS — translate toward cursor (max ~8px),
   spring back on leave. Off for reduced motion / coarse pointers.
   ============================================================ */
(function initMagneticButtons() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return;

  var MAX = 8;
  document.querySelectorAll('.hero-ctas a').forEach(function (btn) {
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      var tx = Math.max(-MAX, Math.min(MAX, dx * 0.3));
      var ty = Math.max(-MAX, Math.min(MAX, dy * 0.4));
      btn.style.transition = 'transform 60ms ease-out';
      btn.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
    }, { passive: true });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   FROM THE SHOP — render 3 products (badged first) into the strip
   Cards reuse the .product-card look and link to shop.html.
   ============================================================ */
(function initShopStrip() {
  var grid = document.getElementById('shop-strip-grid');
  if (!grid || !window.AISO || !Array.isArray(window.AISO.products)) return;

  var products = window.AISO.products;
  var withBadge = products.filter(function (p) { return p.badge; });
  var without   = products.filter(function (p) { return !p.badge; });
  var picks = withBadge.concat(without).slice(0, 3);
  if (!picks.length) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  grid.innerHTML = picks.map(function (p) {
    var price = p.price === 0 ? 'Free' : '$' + p.price + '<span>one-time</span>';
    var badge = p.badge ? '<span class="product-badge">' + esc(p.badge) + '</span>' : '';
    return '<a class="product-card reveal-card" href="shop.html" aria-label="' + esc(p.title) + ' — view in shop">' +
        badge +
        '<span class="product-kind">' + esc(p.kind) + '</span>' +
        '<h3 class="product-title">' + esc(p.title) + '</h3>' +
        '<p class="product-desc">' + esc(p.desc) + '</p>' +
        '<div class="product-foot">' +
          '<div class="product-price">' + price + '</div>' +
          '<span class="shop-strip-cta">View →</span>' +
        '</div>' +
      '</a>';
  }).join('');

  // Re-scan so the injected reveal-cards animate in on scroll.
  if (window.AISO.observeReveals) window.AISO.observeReveals();
})();

/* ============================================================
   CARD TILT — restrained 3D tilt (max ~4deg) on preview cards.
   Off for reduced motion / coarse pointers. rAF-throttled.
   ============================================================ */
(function initCardTilt() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return;

  var MAX = 4; // degrees
  document.querySelectorAll('.tool-card, .library-card, .blog-card').forEach(function (card) {
    var raf = null;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        card.style.transition = 'transform 80ms ease-out';
        card.style.transform =
          'perspective(700px) rotateX(' + (-py * MAX * 2).toFixed(2) + 'deg) rotateY(' +
          (px * MAX * 2).toFixed(2) + 'deg) translateY(-4px)';
      });
    }, { passive: true });
    card.addEventListener('mouseleave', function () {
      if (raf) cancelAnimationFrame(raf);
      card.style.transition = 'transform 400ms ease';
      card.style.transform = '';
    });
  });
})();
