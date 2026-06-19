/**
 * AISolutionsOS — script.js
 * Home-page-specific behavior only.
 * Shared logic (canvas, nav, reveals, smooth scroll, progress, count-up)
 * lives in shared.js.
 */

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
   PIPELINE STEP INTERACTIVE DIM ON HOVER
   ============================================================ */
(function initPipelineInteraction() {
  var steps = document.querySelectorAll('.pipeline-step');
  steps.forEach(function (step) {
    var card = step.querySelector('.step-card');
    if (!card) return;
    card.addEventListener('mouseenter', function () {
      steps.forEach(function (s) {
        var c = s.querySelector('.step-card');
        if (c && c !== card) { c.style.opacity = '0.5'; c.style.transition = 'opacity 0.2s ease'; }
      });
    });
    card.addEventListener('mouseleave', function () {
      steps.forEach(function (s) {
        var c = s.querySelector('.step-card');
        if (c) c.style.opacity = '1';
      });
    });
  });
})();
