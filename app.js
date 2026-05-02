// Aromal Tutoring — vanilla JS interactions
// Replaces React. Static HTML renders crawlable content; this script
// progressively enhances with the blackboard typewriter, stat counters,
// accordions, carousel scroll, and lazy-loaded Calendly widget.

(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Footer year ────────────────────────────────────────
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ─── Blackboard typewriter rotation ─────────────────────
  const PROBLEMS = [
    { tag: 'AP Calc AB · 2024 FRQ #3', title: 'Find the area between the curves.', lines: [
      ['eq',   '∫₀² (x² − 2x + 4) dx − ∫₀² (x) dx', 950],
      ['note', '↳ subtract lower from upper, then integrate', 1100],
      ['eq',   '= ∫₀² (x² − 3x + 4) dx', 800],
      ['eq',   '= [⅓x³ − 3⁄2 x² + 4x]₀²', 900],
      ['final','= ⁸⁄₃ − 6 + 8 = 14⁄3', 800],
    ]},
    { tag: 'SAT Math · No-Calc · #18', title: 'Solve for x.', lines: [
      ['eq',   '3(2x − 5) = 4x + 7', 850],
      ['note', '↳ distribute first, isolate later', 1000],
      ['eq',   '6x − 15 = 4x + 7', 700],
      ['eq',   '2x = 22', 600],
      ['final','x = 11', 700],
    ]},
    { tag: 'AP Physics 2 · Magnetism', title: 'Force on a current-carrying wire.', lines: [
      ['eq',   'F = BIL sin θ', 850],
      ['note', '↳ B = 0.4 T, I = 5 A, L = 0.3 m, θ = 90°', 1100],
      ['eq',   'F = (0.4)(5)(0.3)(1)', 850],
      ['final','F = 0.6 N', 700],
    ]},
    { tag: 'MHF4U · Logarithms', title: 'Solve the log equation.', lines: [
      ['eq',   'log₂(x) + log₂(x − 2) = 3', 900],
      ['note', '↳ combine using product rule', 1000],
      ['eq',   'log₂(x(x − 2)) = 3', 800],
      ['eq',   'x² − 2x = 8', 700],
      ['final','x = 4', 700],
    ]},
  ];

  const bb = document.getElementById('blackboard');
  if (bb && !reduce) {
    const tagEl   = bb.querySelector('[data-bb="tag"]');
    const titleEl = bb.querySelector('[data-bb="title"]');
    const workEl  = bb.querySelector('[data-bb="work"]');
    const dotsEl  = bb.querySelector('[data-bb="progress"]');
    let idx = 0;

    const renderProblem = (p) => {
      tagEl.textContent = p.tag;
      titleEl.textContent = p.title;
      workEl.innerHTML = '';
      [...dotsEl.children].forEach((d, i) => d.classList.toggle('on', i === idx));
    };

    const typewrite = (el, text, perChar) => new Promise((resolve) => {
      let i = 0;
      el.innerHTML = '<span></span><span class="bb-caret">▍</span>';
      const span = el.firstChild;
      const id = setInterval(() => {
        i++;
        span.textContent = text.slice(0, i);
        if (i >= text.length) { clearInterval(id); el.removeChild(el.lastChild); resolve(); }
      }, perChar);
    });

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const playProblem = async () => {
      const p = PROBLEMS[idx];
      renderProblem(p);
      for (const [type, text, pause] of p.lines) {
        const line = document.createElement('div');
        line.className = `bb-line bb-${type}`;
        workEl.appendChild(line);
        await typewrite(line, text, type === 'final' ? 32 : 22);
        await wait(pause);
      }
      await wait(1800);
      bb.classList.add('wiping');
      await wait(700);
      bb.classList.remove('wiping');
      idx = (idx + 1) % PROBLEMS.length;
      playProblem();
    };

    // Start animation only when hero is visible (saves CPU on tabs in background)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); playProblem(); }
      }, { threshold: 0.2 });
      io.observe(bb);
    } else {
      playProblem();
    }
  }

  // ─── Stat counters ──────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduce) { el.textContent = target.toLocaleString(); return; }
      const ms = 1400;
      let t0;
      const step = (t) => {
        if (!t0) t0 = t;
        const p = Math.min(1, (t - t0) / ms);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  }

  // ─── Subjects accordion (single-open) ───────────────────
  document.querySelectorAll('.catalog .row').forEach((row) => {
    row.addEventListener('click', () => {
      const expanded = row.getAttribute('aria-expanded') === 'true';
      const detail = document.getElementById(row.getAttribute('aria-controls'));
      // collapse all
      document.querySelectorAll('.catalog .row').forEach((r) => {
        r.setAttribute('aria-expanded', 'false');
        const d = document.getElementById(r.getAttribute('aria-controls'));
        if (d) d.classList.remove('open');
        const a = r.querySelector('.arrow'); if (a) a.textContent = '↗';
      });
      if (!expanded) {
        row.setAttribute('aria-expanded', 'true');
        if (detail) detail.classList.add('open');
        const a = row.querySelector('.arrow'); if (a) a.textContent = '−';
      }
    });
  });

  // ─── FAQ accordion (single-open) ────────────────────────
  document.querySelectorAll('.faq-item .q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── Voices carousel scroll buttons ─────────────────────
  const track = document.getElementById('t-track');
  if (track) {
    document.querySelectorAll('[data-scroll]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.dataset.scroll, 10);
        track.scrollBy({ left: dir * 380, behavior: 'smooth' });
      });
    });
  }

  // ─── Calendly: lazy-load on intersection (saves ~250KB on first paint) ───
  const calendlyMount = document.getElementById('calendly-mount');
  if (calendlyMount && 'IntersectionObserver' in window) {
    const CALENDLY_URL = 'https://calendly.com/aromalmihraj42/sat-tutoring?hide_gdpr_banner=1&background_color=f1ebde&text_color=1a1815&primary_color=b14a2c';
    const mountWidget = () => {
      calendlyMount.innerHTML = '';
      calendlyMount.className = 'calendly-inline-widget';
      calendlyMount.style.minWidth = '320px';
      calendlyMount.style.height = '680px';
      // Use the official programmatic API rather than relying on
      // widget.js's DOMContentLoaded auto-scan (which we'd miss).
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: calendlyMount });
      } else {
        // Fallback: replace mount with a plain link if the SDK never loads
        calendlyMount.className = 'calendly-fallback';
        calendlyMount.innerHTML = '<p>Couldn\'t load the calendar. <a href="' + CALENDLY_URL + '" target="_blank" rel="noopener">Open Calendly in a new tab →</a></p>';
      }
    };
    const loadCalendly = () => {
      // If widget.js is already on the page (e.g., second mount), just init
      if (window.Calendly) { mountWidget(); return; }
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = mountWidget;
      script.onerror = () => {
        calendlyMount.className = 'calendly-fallback';
        calendlyMount.innerHTML = '<p>Calendly didn\'t load. <a href="' + CALENDLY_URL + '" target="_blank" rel="noopener">Open it in a new tab →</a></p>';
      };
      document.body.appendChild(script);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); loadCalendly(); }
    }, { rootMargin: '400px' });
    io.observe(calendlyMount);
  }

  // ─── Hide nav on scroll-down, show on scroll-up ────────
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 100 && y > lastY) nav.style.transform = 'translateY(-100%)';
        else nav.style.transform = 'translateY(0)';
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }
})();
