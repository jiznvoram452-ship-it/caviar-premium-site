/* ==========================================================================
   IMPERIAL CAVIAR — Premium Interactions
   Custom Cursor / Preloader / Scroll Reveal / Counters / Tilt Cards
   Mobile Menu / Order Form / Modal / Header Scroll
   ========================================================================== */

(() => {
  'use strict';

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const html = document.documentElement;

  /* ---------------------------------------------------------------------
     UTILITIES
  --------------------------------------------------------------------- */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const lerp = (start, end, t) => start + (end - start) * t;
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     PRELOADER
  --------------------------------------------------------------------- */
  const initPreloader = () => {
    const preloader = qs('#preloader');
    if (!preloader) return;

    const hide = () => {
      preloader.classList.add('is-hidden');
      html.classList.remove('is-loading');
      html.classList.add('is-loaded');
      setTimeout(() => preloader.remove(), 900);
      window.dispatchEvent(new CustomEvent('app:loaded'));
    };

    html.classList.add('is-loading');

    const minTime = new Promise((resolve) => setTimeout(resolve, 1400));
    const pageLoad = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });

    Promise.all([minTime, pageLoad]).then(hide);

    // Safety fallback
    setTimeout(hide, 4500);
  };

  /* ---------------------------------------------------------------------
     CUSTOM CURSOR (dot / trail / glow)
  --------------------------------------------------------------------- */
  const initCustomCursor = () => {
    if (isTouch) return;

    const dot = qs('#cursorDot');
    const glow = qs('#cursorGlow');
    const trail = qs('#cursorTrail');
    if (!dot || !glow || !trail) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let dotX = mouseX, dotY = mouseY;
    let trailX = mouseX, trailY = mouseY;
    let glowX = mouseX, glowY = mouseY;

    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        glow.style.opacity = '1';
        trail.style.opacity = '1';
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      dot.style.opacity = '0';
      glow.style.opacity = '0';
      trail.style.opacity = '0';
    });

    const raf = () => {
      // Dot follows fast
      dotX = lerp(dotX, mouseX, 0.35);
      dotY = lerp(dotY, mouseY, 0.35);

      // Trail follows medium
      trailX = lerp(trailX, mouseX, 0.16);
      trailY = lerp(trailY, mouseY, 0.16);

      // Glow follows slow, wide
      glowX = lerp(glowX, mouseX, 0.09);
      glowY = lerp(glowY, mouseY, 0.09);

      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
      glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Hover states on interactive elements
    const hoverTargets = 'a, button, .tilt-card, input, textarea, select, [data-cursor-hover]';

    const growCursor = () => {
      dot.style.transform += ' scale(0)';
      trail.classList.add('cursor-trail--hover');
      trail.style.width = '64px';
      trail.style.height = '64px';
      trail.style.borderColor = 'rgba(212,175,55,0.85)';
      glow.style.opacity = '0.9';
    };

    const resetCursor = () => {
      trail.classList.remove('cursor-trail--hover');
      trail.style.width = '34px';
      trail.style.height = '34px';
      trail.style.borderColor = 'rgba(212, 175, 55, 0.45)';
    };

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) growCursor();
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) resetCursor();
    });

    // Click pulse
    document.addEventListener('mousedown', () => {
      dot.style.transform += ' scale(0.6)';
    });
    document.addEventListener('mouseup', () => {
      dot.style.transform = dot.style.transform.replace(' scale(0.6)', '');
    });
  };

  /* ---------------------------------------------------------------------
     HEADER SCROLL STATE
  --------------------------------------------------------------------- */
  const initHeaderScroll = () => {
    const header = qs('#header');
    if (!header) return;

    let lastScroll = 0;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 60) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      lastScroll = scrollY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  /* ---------------------------------------------------------------------
     MOBILE MENU / BURGER
  --------------------------------------------------------------------- */
  const initMobileMenu = () => {
    const burger = qs('#burger');
    const mobileMenu = qs('#mobileMenu');
    if (!burger || !mobileMenu) return;

    const links = qsa('.mobile-link', mobileMenu);

    const toggleMenu = (forceState) => {
      const isOpen = typeof forceState === 'boolean'
        ? forceState
        : !burger.classList.contains('is-active');

      burger.classList.toggle('is-active', isOpen);
      mobileMenu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      html.style.overflow = isOpen ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggleMenu());

    links.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) toggleMenu(false);
    });
  };

  /* ---------------------------------------------------------------------
     SMOOTH ANCHOR SCROLL (offset for fixed header)
  --------------------------------------------------------------------- */
  const initSmoothAnchors = () => {
    const header = qs('#header');
    const headerHeight = () => (header ? header.offsetHeight : 0);

    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = qs(targetId);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight() + 20);
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  /* ---------------------------------------------------------------------
     SCROLL REVEAL (Intersection Observer)
  --------------------------------------------------------------------- */
  const initScrollReveal = () => {
    const revealEls = qsa('[data-reveal]');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.revealDelay
            ? parseFloat(el.dataset.revealDelay)
            : (index % 6) * 90;

          setTimeout(() => el.classList.add('is-visible'), delay);
          obs.unobserve(el);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    });

    revealEls.forEach((el) => observer.observe(el));
  };

  /* ---------------------------------------------------------------------
     ANIMATED COUNTERS (stats)
  --------------------------------------------------------------------- */
  const initCounters = () => {
    const counters = qsa('[data-count]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;

      const duration = 1800;
      const startTime = performance.now();
      const startVal = 0;

      const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const eased = easeOutExpo(progress);
        const value = Math.floor(lerp(startVal, target, eased));
        el.textContent = value;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => observer.observe(el));
  };

  /* ---------------------------------------------------------------------
     3D TILT EFFECT (product / catalog cards)
  --------------------------------------------------------------------- */
  const initTiltCards = () => {
    if (isTouch) return;

    const cards = qsa('.tilt-card, .product-card, [data-tilt]');
    if (!cards.length) return;

    const MAX_ROTATE = 12;
    const PERSPECTIVE = 1000;
    const SCALE_HOVER = 1.03;

    cards.forEach((card) => {
      const inner = card.querySelector('[data-tilt-inner]') ||