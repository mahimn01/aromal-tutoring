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

  // ─── Calendly: lazy-load on intersection ───────────────
  // Explicit init via Calendly.initInlineWidget({url, parentElement}). The
  // mount div in the HTML deliberately omits class="calendly-inline-widget"
  // so widget.js's auto-discovery skips it. This avoids two failure modes:
  //   1. Auto-discovery races against our lazy script load
  //   2. Calendly's iframe ends up underneath our absolute-positioned loading state
  const calendlyMount = document.getElementById('calendly-mount');
  if (calendlyMount && 'IntersectionObserver' in window) {
    const CALENDLY_URL = 'https://calendly.com/aromalmihraj42/sat-tutoring?hide_gdpr_banner=1&background_color=f1ebde&text_color=1a1815&primary_color=b14a2c';
    const CALENDLY_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';

    const showFallback = (msg) => {
      calendlyMount.innerHTML =
        '<div class="calendly-loading"><p>' + msg + '</p>' +
        '<a href="https://calendly.com/aromalmihraj42/sat-tutoring" ' +
        'target="_blank" rel="noopener noreferrer">' +
        'Open Calendly in a new tab &rarr;</a></div>';
    };

    // Poll briefly for window.Calendly. The script is parsed/executed synchronously
    // before script.onload fires, so this almost always succeeds on attempt 0.
    const initWidget = (attempts) => {
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        // Tear down loading state so Calendly's iframe is the only child.
        calendlyMount.innerHTML = '';
        try {
          window.Calendly.initInlineWidget({
            url: CALENDLY_URL,
            parentElement: calendlyMount
          });
        } catch (err) {
          showFallback('Calendly returned an error.');
        }
        return;
      }
      if (attempts >= 60) {  // ~3s of polling at 50ms
        showFallback("Calendly didn't initialize.");
        return;
      }
      setTimeout(() => initWidget(attempts + 1), 50);
    };

    const loadCalendly = () => {
      // If something else already loaded the script (or Calendly global exists), init now.
      if (window.Calendly) { initWidget(0); return; }
      const existing = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
      if (existing) {
        // Wait for the existing script to finish, then init
        if (existing.readyState === 'complete' || existing.readyState === 'loaded') initWidget(0);
        else existing.addEventListener('load', () => initWidget(0));
        return;
      }
      const script = document.createElement('script');
      script.src = CALENDLY_SCRIPT;
      script.async = true;
      script.onload = () => initWidget(0);
      script.onerror = () => showFallback("Couldn't reach Calendly.");
      document.body.appendChild(script);
      // Safety net: if 15s pass and there's still no iframe, surface a fallback link.
      setTimeout(() => {
        if (!calendlyMount.querySelector('iframe')) showFallback('Taking longer than expected.');
      }, 15000);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); loadCalendly(); }
    }, { rootMargin: '600px' });
    io.observe(calendlyMount);
  }

  // ─── Hide nav on scroll-down, show on scroll-up ────────
  const nav = document.querySelector('.nav');
  let suppressNavHide = false;   // pause hide-on-scroll during programmatic scrolls
  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (suppressNavHide || y < 100) nav.style.transform = 'translateY(0)';
        else if (y > lastY) nav.style.transform = 'translateY(-100%)';
        else nav.style.transform = 'translateY(0)';
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  // ─── Robust anchor-link smooth scroll ──────────────────
  // Computes the nav height live (so it works on any screen size, even after
  // resize), keeps the nav visible during the programmatic scroll, and updates
  // the URL hash without triggering a second jump.
  const scrollToId = (id) => {
    const target = document.getElementById(id);
    if (!target) return false;
    const navH = nav ? nav.offsetHeight : 64;
    const y = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    suppressNavHide = true;
    nav && (nav.style.transform = 'translateY(0)');
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    // Re-enable nav-hide once the smooth scroll has had time to settle.
    setTimeout(() => { suppressNavHide = false; }, 900);
    return true;
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    if (scrollToId(id)) {
      e.preventDefault();
      // Push the hash without the browser's native instant-jump.
      if (history.pushState) history.pushState(null, '', '#' + id);
    }
  });

  // Honor a hash in the URL on initial load (after fonts/images settle).
  if (location.hash && location.hash.length > 1) {
    const id = location.hash.slice(1);
    // Wait one frame so layout is committed, then scroll without animation
    // (initial-load smooth-scroll feels like an unrequested motion).
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const navH = nav ? nav.offsetHeight : 64;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 12, behavior: 'auto' });
    }));
  }
})();
