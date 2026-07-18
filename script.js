/* ==========================================================================
   PREMIUM CAVIAR — script.js
   Luxury interactive experience
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Utils
     ---------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const lerp = (start, end, t) => start + (end - start) * t;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initSmoothScroll();
    initActiveNavObserver();
    initRevealObserver();
    initTiltEffect();
    if (!isTouchDevice) initCustomCursor();
    initCounters();
    initForms();
    initHeaderScrollState();
  });

  /* ------------------------------------------------------------------------
     1. Burger Menu
     ---------------------------------------------------------------------- */
  function initBurgerMenu() {
    const burger = $('#burger');
    const nav = $('#nav');
    if (!burger || !nav) return;

    const body = document.body;

    const openMenu = () => {
      nav.classList.add('nav--open');
      burger.classList.add('burger--active');
      burger.setAttribute('aria-expanded', 'true');
      body.classList.add('no-scroll');
    };

    const closeMenu = () => {
      nav.classList.remove('nav--open');
      burger.classList.remove('burger--active');
      burger.setAttribute('aria-expanded', 'false');
      body.classList.remove('no-scroll');
    };

    const toggleMenu = () => {
      nav.classList.contains('nav--open') ? closeMenu() : openMenu();
    };

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close on link click
    $$('a', nav).forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('nav--open') &&
        !nav.contains(e.target) &&
        !burger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && nav.classList.contains('nav--open')) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Smooth Scroll
     ---------------------------------------------------------------------- */
  function initSmoothScroll() {
    const header = $('#header');
    const getHeaderHeight = () => (header ? header.offsetHeight : 0);

    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;

        const target = $(href);
        if (!target) return;

        e.preventDefault();

        const offsetTop =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          getHeaderHeight() -
          8;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });

        // Update URL without jumping
        history.pushState(null, '', href);
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. Active Nav Link Highlighting (Intersection Observer)
     ---------------------------------------------------------------------- */
  function initActiveNavObserver() {
    const sections = $$('main section[id]');
    const navLinks = $$('#nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      linkMap.set(id, link);
    });

    const header = $('#header');
    const headerHeight = header ? header.offsetHeight : 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = linkMap.get(id);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('nav__link--active'));
            link.classList.add('nav__link--active');
          }
        });
      },
      {
        root: null,
        rootMargin: `-${headerHeight + 40}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------------
     4. Reveal on Scroll
     ---------------------------------------------------------------------- */
  function initRevealObserver() {
    const revealEls = $$('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || 0;
            setTimeout(() => {
              entry.target.classList.add('reveal--visible');
            }, Number(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12,
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     5. 3D Tilt Effect for Product Cards
     ---------------------------------------------------------------------- */
  function initTiltEffect() {
    const cards = $$('.product-card');
    if (!cards.length) return;

    const MAX_TILT = 12;
    const SCALE_HOVER = 1.03;
    const PERSPECTIVE = 900;

    cards.forEach((card) => {
      let rafId = null;
      let bounds = null;

      const inner = card.querySelector('.product-card__inner') || card;
      const glare = card.querySelector('.product-card__glare');

      const updateBounds = () => {
        bounds = card.getBoundingClientRect();
      };

      const handleMouseEnter = () => {
        updateBounds();
        card.classList.add('product-card--active');
      };

      const handleMouseMove = (e) => {
        if (!bounds) updateBounds();

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const x = e.clientX - bounds.left;
          const y = e.clientY - bounds.top;

          const percentX = x / bounds.width;
          const percentY = y / bounds.height;

          const rotateY = clamp((percentX - 0.5) * (MAX_TILT * 2), -MAX_TILT, MAX_TILT);
          const rotateX = clamp((0.5 - percentY) * (MAX_TILT * 2), -MAX_TILT, MAX_TILT);

          inner.style.transform = `
            perspective(${PERSPECTIVE}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(${SCALE_HOVER}, ${SCALE_HOVER}, ${SCALE_HOVER})
          `;

          if (glare) {
            glare.style.background = `radial-gradient(
              circle at ${percentX * 100}% ${percentY * 100}%,
              rgba(255,255,255,0.25) 0%,
              rgba(255,255,255,0) 60%
            )`;
            glare.style.opacity = '1';
          }
        });
      };

      const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.classList.remove('product-card--active');
        inner.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        inner.style.transform = `
          perspective(${PERSPECTIVE}px)
          rotateX(0deg)
          rotateY(0deg)
          scale3d(1, 1, 1)
        `;
        if (glare) glare.style.opacity = '0';

        setTimeout(() => {
          inner.style.transition = '';
        }, 600);
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', updateBounds);
      window.addEventListener('scroll', () => { bounds = null; }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------------
     6. Custom Cursor with Glow Trail
     ---------------------------------------------------------------------- */
  function initCustomCursor() {
    const cursor = $('.custom-cursor');
    const dot = $('.custom-cursor__dot');
    if (!cursor || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let cursorX = mouseX;
    let cursorY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;

    const CURSOR_SPEED = 0.14;
    const DOT_SPEED = 0.35;

    let isVisible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = '1';
        dot.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursor.style.opacity = '0';
      dot.style.opacity = '0';
    });

    // Interactive hover states
    const hoverTargets = 'a, button, .product-card, input, textarea, select, [data-cursor-hover]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('custom-cursor--hover');
        dot.classList.add('custom-cursor__dot--hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('custom-cursor--hover');
        dot.classList.remove('custom-cursor__dot--hover');
      }
    });

    // Press state
    document.addEventListener('mousedown', () => {
      cursor.classList.add('custom-cursor--press');
    });
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('custom-cursor--press');
    });

    function animateCursor() {
      cursorX = lerp(cursorX, mouseX, CURSOR_SPEED);
      cursorY = lerp(cursorY, mouseY, CURSOR_SPEED);

      dotX = lerp(dotX, mouseX, DOT_SPEED);
      dotY = lerp(dotY, mouseY, D