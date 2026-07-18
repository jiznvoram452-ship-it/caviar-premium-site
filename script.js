'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Preloader fadeout
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 800);
    }, 600);
  }

  // 2. Custom Cursor Trail (Desktop only)
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');

  if (!isTouch && cursorGlow && cursorDot) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const render = () => {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    // Hover effect
    const hovers = document.querySelectorAll('a, button, .btn, .product-card, input, textarea, select');
    hovers.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorGlow.classList.add('hover');
        cursorDot.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('hover');
        cursorDot.classList.remove('hover');
      });
    });
  } else {
    if (cursorGlow) cursorGlow.remove();
    if (cursorDot) cursorDot.remove();
    const trail = document.getElementById('cursorTrail');
    if (trail) trail.remove();
  }

  // 3. Burger Menu
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const siteHeader = document.getElementById('siteHeader');

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Header scroll class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 4. Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const offset = siteHeader ? siteHeader.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. Countup Animation
  const stats = document.querySelectorAll('.hero-stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 2000;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      el.textContent = Math.floor(ease * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(update);
  };

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(s => countObserver.observe(s));

  // 6. Reveal on Scroll
  const revealElements = document.querySelectorAll('[data-reveal], .product-card, .process-step, .review-card, .about-media');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // 7. 3D Tilt Effect (Desktop only)
  const tiltElements = document.querySelectorAll('.product-card, .about-media, .gallery-item');
  if (!isTouch) {
    tiltElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const rotateX = -(y - yc) / 10;
        const rotateY = (x - xc) / 10;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        el.style.transition = 'transform 0.5s ease';
      });

      el.addEventListener('mouseenter', () => {
        el.style.transition = 'none';
      });
    });
  }

  // 8. Form Submission (simulate)
  const forms = document.querySelectorAll('form, .order-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Отправка...</span>';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<span>Успешно отправлено!</span>';
        btn.style.background = '#4CAF50';
        btn.style.borderColor = '#4CAF50';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
        }, 2000);
      }, 1200);
    });
  });
});