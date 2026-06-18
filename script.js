/**
 * AISolutionsOS — script.js
 * Particle canvas, animations, scroll reveals, and interactivity
 */

/* ============================================================
   1. CANVAS PARTICLE BACKGROUND
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;
  let mouse = { x: -9999, y: -9999 };

  const CONFIG = {
    particleCount: 80,
    maxSpeed:       0.45,
    minRadius:      1.5,
    maxRadius:      3,
    connectionDist: 150,
    mouseInfluence:  220,
    colors: ['#4f8ef7', '#8b5cf6', '#06b6d4', '#4f8ef7', '#4f8ef7'],
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function createParticle() {
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    const rgb = hexToRgb(color);
    return {
      x:     randomBetween(0, W),
      y:     randomBetween(0, H),
      vx:    randomBetween(-CONFIG.maxSpeed, CONFIG.maxSpeed),
      vy:    randomBetween(-CONFIG.maxSpeed, CONFIG.maxSpeed),
      r:     randomBetween(CONFIG.minRadius, CONFIG.maxRadius),
      rgb,
      alpha: randomBetween(0.4, 0.9),
      phase: randomBetween(0, Math.PI * 2),
    };
  }

  function initParticles() {
    particles = Array.from({ length: CONFIG.particleCount }, createParticle);
  }

  function drawParticle(p, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + p.phase);
    const alpha = p.alpha * (0.7 + 0.3 * pulse);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + p.rgb.r + ', ' + p.rgb.g + ', ' + p.rgb.b + ', ' + alpha + ')';
    ctx.fill();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const pi = particles[i];
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * 0.18;
          const midRgb = {
            r: Math.round((pi.rgb.r + pj.rgb.r) / 2),
            g: Math.round((pi.rgb.g + pj.rgb.g) / 2),
            b: Math.round((pi.rgb.b + pj.rgb.b) / 2),
          };
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = 'rgba(' + midRgb.r + ', ' + midRgb.g + ', ' + midRgb.b + ', ' + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseConnections() {
    particles.forEach(function(p) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseInfluence) {
        const alpha = (1 - dist / CONFIG.mouseInfluence) * 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(79, 142, 247, ' + alpha + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }

  function updateParticle(p) {
    p.x += p.vx;
    p.y += p.vy;

    // Wrap edges
    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    drawMouseConnections();
    particles.forEach(function(p) {
      updateParticle(p);
      drawParticle(p, t);
    });
    animFrame = requestAnimationFrame(render);
  }

  // Init
  resize();
  initParticles();
  animFrame = requestAnimationFrame(render);

  window.addEventListener('resize', function() {
    cancelAnimationFrame(animFrame);
    resize();
    initParticles();
    animFrame = requestAnimationFrame(render);
  });

  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function() {
    mouse.x = -9999;
    mouse.y = -9999;
  });
})();


/* ============================================================
   2. STICKY NAV WITH GLASSMORPHISM
   ============================================================ */
(function initNav() {
  const nav    = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  if (!nav) return;

  // Scroll-triggered glass
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        if (window.scrollY > 20) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      const isOpen = toggle.classList.toggle('open');
      links.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        toggle.classList.remove('open');
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target)) {
        toggle.classList.remove('open');
        links.classList.remove('open');
      }
    });
  }
})();


/* ============================================================
   3. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navHeight = 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   4. INTERSECTION OBSERVER — SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
  var fadeEls  = document.querySelectorAll('.reveal-fade');
  var cardEls  = document.querySelectorAll('.reveal-card');

  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  var cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Staggered delay for sibling cards
        var siblings = Array.from(entry.target.parentElement.children)
          .filter(function(el) { return el.classList.contains('reveal-card'); });
        var index = siblings.indexOf(entry.target);
        var delay = Math.min(index * 80, 480);
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  fadeEls.forEach(function(el) { fadeObserver.observe(el); });
  cardEls.forEach(function(el) { cardObserver.observe(el); });
})();


/* ============================================================
   5. PIPELINE SECTION — SEQUENTIAL ANIMATION
   ============================================================ */
(function initPipeline() {
  var steps  = document.querySelectorAll('.pipeline-step');
  var arrows = document.querySelectorAll('.pipeline-arrow');

  if (!steps.length) return;

  var pipelineObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Stagger each step and each arrow
        steps.forEach(function(step, i) {
          setTimeout(function() {
            step.classList.add('visible');
          }, i * 180);
        });
        arrows.forEach(function(arrow, i) {
          setTimeout(function() {
            arrow.classList.add('visible');
          }, i * 180 + 90);
        });
        pipelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  var pipelineTrack = document.querySelector('.pipeline-track');
  if (pipelineTrack) pipelineObserver.observe(pipelineTrack);
})();


/* ============================================================
   6. LIBRARY CATEGORY FILTER
   ============================================================ */
(function initLibraryFilter() {
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.library-card');

  if (!pills.length || !cards.length) return;

  // Ensure all cards start visible
  cards.forEach(function(card) {
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  });

  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      // Update active pill
      pills.forEach(function(p) { p.classList.remove('active'); });
      pill.classList.add('active');

      var filter = pill.dataset.filter;

      cards.forEach(function(card, i) {
        var category = card.dataset.category;
        var shouldShow = filter === 'all' || category === filter;

        if (!shouldShow) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.94) translateY(8px)';
          setTimeout(function() {
            card.classList.add('hidden');
          }, 250);
        } else {
          card.classList.remove('hidden');
          setTimeout(function() {
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          }, 20 + i * 50);
        }
      });
    });
  });
})();


/* ============================================================
   7. TOOL CARD GLOW ON HOVER (JS-enhanced mouse tracking)
   ============================================================ */
(function initToolCardGlow() {
  var cards = document.querySelectorAll('.tool-card');

  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var glow = card.querySelector('.tool-glow');
      if (glow) {
        glow.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(79, 142, 247, 0.1) 0%, transparent 60%)';
      }
    });

    card.addEventListener('mouseleave', function() {
      var glow = card.querySelector('.tool-glow');
      if (glow) {
        glow.style.background = 'radial-gradient(ellipse at top left, rgba(79, 142, 247, 0.06) 0%, transparent 60%)';
      }
    });
  });
})();


/* ============================================================
   8. PIPELINE ARROW PULSE STAGGER
   ============================================================ */
(function initArrowStagger() {
  var arrows = document.querySelectorAll('.pipeline-arrow svg');
  arrows.forEach(function(arrow, i) {
    arrow.style.animationDelay = (i * 0.4) + 's';
  });
})();


/* ============================================================
   9. HERO ENTRY ANIMATION — staggered fade-in on load
   ============================================================ */
(function initHeroEntry() {
  var heroEls = document.querySelectorAll('.hero-content .reveal-fade');

  heroEls.forEach(function(el, i) {
    el.style.transitionDelay = (i * 120) + 'ms';
    setTimeout(function() {
      el.classList.add('visible');
    }, 150 + i * 120);
  });
})();


/* ============================================================
   10. SCROLL PROGRESS INDICATOR (top bar)
   ============================================================ */
(function initScrollProgress() {
  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'height: 2px',
    'width: 0%',
    'background: linear-gradient(90deg, #4f8ef7, #8b5cf6, #06b6d4)',
    'z-index: 200',
    'transition: width 0.1s linear',
    'pointer-events: none',
  ].join(';');
  document.body.appendChild(bar);

  window.addEventListener('scroll', function() {
    var scrollTop  = window.scrollY;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPct  = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = scrollPct + '%';
  }, { passive: true });
})();


/* ============================================================
   11. PIPELINE STEP INTERACTIVE DIM ON HOVER
   ============================================================ */
(function initPipelineInteraction() {
  var steps = document.querySelectorAll('.pipeline-step');

  steps.forEach(function(step) {
    var card = step.querySelector('.step-card');
    if (!card) return;

    card.addEventListener('mouseenter', function() {
      steps.forEach(function(s) {
        var c = s.querySelector('.step-card');
        if (c && c !== card) {
          c.style.opacity = '0.5';
          c.style.transition = 'opacity 0.2s ease';
        }
      });
    });

    card.addEventListener('mouseleave', function() {
      steps.forEach(function(s) {
        var c = s.querySelector('.step-card');
        if (c) {
          c.style.opacity = '1';
        }
      });
    });
  });
})();


/* ============================================================
   12. STATS COUNT-UP ANIMATION
   ============================================================ */
(function initCountUp() {
  var stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  function animateCount(el, target, suffix, duration) {
    var start = performance.now();

    function tick(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        stats.forEach(function(el) {
          var raw    = el.textContent.trim();
          var suffix = raw.replace(/[0-9]/g, '');
          var num    = parseInt(raw.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) {
            animateCount(el, num, suffix, 1200);
          }
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  var statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObserver.observe(statsEl);
})();
