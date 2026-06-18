/* ================================================
   AISolutionsOS — script.js
   ================================================ */

/* --- Canvas Particle Background --- */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#4f8ef7', '#8b5cf6', '#06b6d4'];
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
      color: randomColor(),
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function initParticles() {
    const count = Math.min(Math.floor((W * H) / 12000), 90);
    particles = Array.from({ length: count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - dist / 130) * 0.18;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); initParticles(); }, 200);
  });
}());


/* --- Sticky Nav --- */
(function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());


/* --- Mobile Nav Toggle --- */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);

    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
}());


/* --- Intersection Observer: reveal-fade & reveal-card --- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-fade, .reveal-card');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, _i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || 0);
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el, i) => {
    if (el.classList.contains('reveal-card')) {
      el.dataset.delay = (i % 4) * 80;
    }
    observer.observe(el);
  });
}());


/* --- Pipeline: staggered step + arrow animation --- */
(function initPipeline() {
  const steps  = document.querySelectorAll('.pipeline-step');
  const arrows = document.querySelectorAll('.pipeline-arrow');
  if (!steps.length) return;

  const track = document.querySelector('.pipeline-track');
  if (!track) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        steps.forEach((step, i) => {
          setTimeout(() => {
            step.classList.add('visible');
            if (arrows[i]) {
              setTimeout(() => arrows[i].classList.add('visible'), 120);
            }
          }, i * 150);
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(track);
}());


/* --- Library Filter Pills --- */
(function initLibraryFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.library-card');
  if (!pills.length || !cards.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);

        if (match) {
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            setTimeout(() => card.classList.add('visible'), 30);
          });
        }
      });
    });
  });
}());
