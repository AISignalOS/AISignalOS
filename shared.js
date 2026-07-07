/**
 * AISolutionsOS — shared.js
 * Shared across every page: icon set, nav + footer injection,
 * particle canvas, scroll reveals, smooth scroll, scroll progress, count-up.
 * Requires data.js to be loaded first (window.AISO).
 */
(function () {
  'use strict';

  /* ============================================================
     ICON SET — reusable inline SVGs (stroke uses currentColor)
     ============================================================ */
  const ICONS = {
    logo:
      '<svg class="logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="14" cy="14" r="3" fill="#4f8ef7"/><circle cx="4" cy="4" r="2" fill="#8b5cf6"/>' +
      '<circle cx="24" cy="4" r="2" fill="#06b6d4"/><circle cx="4" cy="24" r="2" fill="#8b5cf6"/>' +
      '<circle cx="24" cy="24" r="2" fill="#4f8ef7"/>' +
      '<line x1="14" y1="11" x2="4" y2="4" stroke="#4f8ef7" stroke-width="1" opacity="0.6"/>' +
      '<line x1="14" y1="11" x2="24" y2="4" stroke="#06b6d4" stroke-width="1" opacity="0.6"/>' +
      '<line x1="14" y1="17" x2="4" y2="24" stroke="#8b5cf6" stroke-width="1" opacity="0.6"/>' +
      '<line x1="14" y1="17" x2="24" y2="24" stroke="#4f8ef7" stroke-width="1" opacity="0.6"/></svg>',
    doc:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h10M7 12h7M7 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="19" cy="5" r="3" fill="#8b5cf6"/></svg>',
    layers:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    nodes:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="20" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="20" r="2" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="6" x2="10" y2="10" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="18" y1="6" x2="14" y2="10" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="6" y1="18" x2="10" y2="14" stroke="currentColor" stroke-width="1" opacity="0.6"/><line x1="18" y1="18" x2="14" y2="14" stroke="currentColor" stroke-width="1" opacity="0.6"/></svg>',
    terminal:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 8l3 4-3 4M13 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flow:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><rect x="6" y="4" width="4" height="4" rx="1" fill="currentColor"/><rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" opacity="0.7"/><rect x="14" y="16" width="4" height="4" rx="1" fill="currentColor" opacity="0.5"/></svg>',
    check:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grid:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>',
    search:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    arrowLeft:
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 3H17L11.5 9.5L18 17H13L9 12.5L4.5 17H1.5L7.5 10L1 3H6.5L10 7.5L14 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    github:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1C4.58 1 1 4.58 1 9c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0017 9c0-4.42-3.58-8-8-8Z" stroke="currentColor" stroke-width="1.5"/></svg>',
    youtube:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="10" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M7 6.5l5 2.5-5 2.5V6.5Z" fill="currentColor"/></svg>',
  };

  window.AISO = window.AISO || {};
  window.AISO.icons = ICONS;

  /* ============================================================
     NAV + FOOTER INJECTION
     ============================================================ */
  function currentPage() {
    const path = window.location.pathname.split('/').pop();
    return path && path.length ? path : 'index.html';
  }

  function buildNav() {
    const host = document.getElementById('site-nav');
    if (!host) return;
    const here = currentPage();
    const nav = (window.AISO.nav || []);

    const links = nav.map(function (item) {
      const active = item.href === here ? ' class="active"' : '';
      return '<li><a href="' + item.href + '"' + active + '>' + item.label + '</a></li>';
    }).join('');

    host.innerHTML =
      '<nav id="main-nav"><div class="nav-inner">' +
        '<a href="index.html" class="nav-logo">' + ICONS.logo +
          '<span class="logo-text">AISolutionsOS</span></a>' +
        '<button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">' +
          '<span></span><span></span><span></span></button>' +
        '<ul class="nav-links" id="nav-links">' + links + '</ul>' +
        '<a href="tools.html" class="nav-cta btn-primary">Start Building →</a>' +
      '</div></nav>';
  }

  function buildFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<a href="index.html" class="nav-logo footer-logo">' + ICONS.logo +
              '<span class="logo-text">AISolutionsOS</span></a>' +
            '<p class="footer-tagline">Build smarter. Ship faster. Own your systems.</p>' +
            '<div class="footer-social">' +
              '<a href="#" class="social-link" aria-label="X / Twitter">' + ICONS.x + '</a>' +
              '<a href="#" class="social-link" aria-label="GitHub">' + ICONS.github + '</a>' +
              '<a href="#" class="social-link" aria-label="YouTube">' + ICONS.youtube + '</a>' +
            '</div>' +
          '</div>' +
          '<nav class="footer-nav">' +
            '<div class="footer-nav-col"><h4 class="footer-nav-heading">Platform</h4><ul>' +
              '<li><a href="index.html">Home</a></li>' +
              '<li><a href="tools.html">Tools</a></li>' +
              '<li><a href="library.html">AI Library</a></li>' +
              '<li><a href="blog.html">Blog</a></li>' +
            '</ul></div>' +
            '<div class="footer-nav-col"><h4 class="footer-nav-heading">Build</h4><ul>' +
              '<li><a href="build-studio.html">Build Studio</a></li>' +
              '<li><a href="shop.html">Shop</a></li>' +
              '<li><a href="changelog.html">Changelog</a></li>' +
              '<li><a href="glossary.html">Glossary</a></li>' +
            '</ul></div>' +
            '<div class="footer-nav-col"><h4 class="footer-nav-heading">Company</h4><ul>' +
              '<li><a href="about.html">About</a></li>' +
              '<li><a href="resources.html">Resources</a></li>' +
              '<li><a href="submit.html">Submit a Workflow</a></li>' +
            '</ul></div>' +
          '</nav>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<p class="footer-copy">© 2026 AISolutionsOS. All rights reserved.</p>' +
          '<div class="footer-legal"><a href="#">Privacy</a><a href="#">Terms</a></div>' +
        '</div>' +
      '</div></footer>';
  }

  /* ============================================================
     CANVAS PARTICLE BACKGROUND
     ============================================================ */
  function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles, animFrame;
    let mouse = { x: -9999, y: -9999 };

    const CONFIG = {
      particleCount: 70,
      maxSpeed: 0.4,
      minRadius: 1.5,
      maxRadius: 3,
      connectionDist: 150,
      mouseInfluence: 200,
      colors: ['#4f8ef7', '#8b5cf6', '#06b6d4', '#4f8ef7', '#4f8ef7'],
    };

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function hexToRgb(hex) {
      return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
    }
    function makeParticle() {
      const c = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      return { x: rand(0, W), y: rand(0, H), vx: rand(-CONFIG.maxSpeed, CONFIG.maxSpeed), vy: rand(-CONFIG.maxSpeed, CONFIG.maxSpeed), r: rand(CONFIG.minRadius, CONFIG.maxRadius), rgb: hexToRgb(c), alpha: rand(0.4, 0.9), phase: rand(0, Math.PI * 2) };
    }
    function initParticles() { particles = Array.from({ length: CONFIG.particleCount }, makeParticle); }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i], pj = particles[j];
          const dx = pi.x - pj.x, dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.connectionDist) {
            const alpha = (1 - dist / CONFIG.connectionDist) * 0.18;
            const m = { r: Math.round((pi.rgb.r + pj.rgb.r) / 2), g: Math.round((pi.rgb.g + pj.rgb.g) / 2), b: Math.round((pi.rgb.b + pj.rgb.b) / 2) };
            ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = 'rgba(' + m.r + ',' + m.g + ',' + m.b + ',' + alpha + ')';
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }
    }
    function drawMouseConnections() {
      particles.forEach(function (p) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseInfluence) {
          const alpha = (1 - dist / CONFIG.mouseInfluence) * 0.3;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(79,142,247,' + alpha + ')'; ctx.lineWidth = 0.8; ctx.stroke();
        }
      });
    }
    function render(t) {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      drawMouseConnections();
      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + p.phase);
        const alpha = p.alpha * (0.7 + 0.3 * pulse);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.rgb.r + ',' + p.rgb.g + ',' + p.rgb.b + ',' + alpha + ')'; ctx.fill();
      });
      animFrame = requestAnimationFrame(render);
    }

    resize(); initParticles(); animFrame = requestAnimationFrame(render);
    window.addEventListener('resize', function () { cancelAnimationFrame(animFrame); resize(); initParticles(); animFrame = requestAnimationFrame(render); });
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
  }

  /* ============================================================
     NAV BEHAVIOR — sticky glass + mobile toggle
     ============================================================ */
  function initNavBehavior() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!nav) return;

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          nav.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        const isOpen = toggle.classList.toggle('open');
        links.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.classList.remove('open'); links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) { toggle.classList.remove('open'); links.classList.remove('open'); }
      });
    }
  }

  /* ============================================================
     SMOOTH SCROLL (in-page anchors only)
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72 - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     SCROLL REVEAL OBSERVERS
     ============================================================ */
  function initScrollReveal() {
    const fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); fadeObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children)
            .filter(function (el) { return el.classList.contains('reveal-card'); });
          const index = siblings.indexOf(entry.target);
          const delay = Math.min(index * 70, 420);
          setTimeout(function () { entry.target.classList.add('visible'); }, delay);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal-fade').forEach(function (el) { fadeObserver.observe(el); });
    document.querySelectorAll('.reveal-card').forEach(function (el) { cardObserver.observe(el); });
  }

  // Public: re-scan for dynamically inserted reveal elements
  window.AISO.observeReveals = initScrollReveal;

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ============================================================
     COUNT-UP (any .stat-num in view)
     ============================================================ */
  function initCountUp() {
    const stats = document.querySelectorAll('.stat-num');
    if (!stats.length) return;
    function animate(el, target, suffix, duration) {
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-num').forEach(function (el) {
            const raw = el.textContent.trim();
            const suffix = raw.replace(/[0-9]/g, '');
            const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(num)) animate(el, num, suffix, 1200);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-row, .hero-stats').forEach(function (row) { obs.observe(row); });
  }

  /* ============================================================
     PAGE INTRO — fade in .reveal-fade marked data-intro on load
     ============================================================ */
  function initPageIntro() {
    const intro = document.querySelectorAll('[data-intro] .reveal-fade');
    intro.forEach(function (el, i) {
      el.style.transitionDelay = (i * 100) + 'ms';
      setTimeout(function () { el.classList.add('visible'); }, 120 + i * 100);
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    buildNav();
    buildFooter();
    initCanvas();
    initNavBehavior();
    initSmoothScroll();
    initScrollReveal();
    initScrollProgress();
    initCountUp();
    initPageIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
