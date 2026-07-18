'use strict';

/* =============================================================
   CAVIAR IMPERIAL — Main Script
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. HEADER: изменение вида при прокрутке
  --------------------------------------------------------- */
  const header = document.getElementById('header');

  const handleHeaderScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ---------------------------------------------------------
     2. БУРГЕР-МЕНЮ (мобильная навигация)
  --------------------------------------------------------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const toggleMenu = () => {
    burger.classList.toggle('active');
    nav.classList.toggle('nav--open');
    document.body.classList.toggle('no-scroll');
  };

  const closeMenu = () => {
    burger.classList.remove('active');
    nav.classList.remove('nav--open');
    document.body.classList.remove('no-scroll');
  };

  if (burger && nav) {
    burger.addEventListener('click', toggleMenu);

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('nav--open') &&
        !nav.contains(e.target) &&
        !burger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. ПЛАВНАЯ ПРОКРУТКА К СЕКЦИЯМ
  --------------------------------------------------------- */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      history.pushState(null, '', targetId);
    });
  });

  /* ---------------------------------------------------------
     4. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ПРИ СКРОЛЛЕ
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('id');
          const link = document.querySelector(`.nav a[href="#${id}"]`);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('nav__link--active'));
            link.classList.add('nav__link--active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(section => navObserver.observe(section));
  }

  /* ---------------------------------------------------------
     5. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ (Intersection Observer)
  --------------------------------------------------------- */
  const revealSelectors = [
    '.section-eyebrow',
    '.section-title',
    '.section-subtitle',
    '.about__media',
    '.about__content',
    '.about__list li',
    '.product-card',
    '.stat',
    '.review-card',
    '.process-step',
    '.delivery__item',
    '.contact-card'
  ];

  const revealElements = document.querySelectorAll(revealSelectors.join(','));

  revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${(index % 6) * 90}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     6. СЧЁТЧИКИ В HERO (анимация цифр)
  --------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat__num');

  const animateCount = (el) => {
    const target = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  if (statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach(num => statsObserver.observe(num));
  }

  /* ---------------------------------------------------------
     7. ОБРАБОТКА ФОРМ (заказ / дегустация / контакты)
  --------------------------------------------------------- */
  const forms = document.querySelectorAll('form');

  const showFormMessage = (form, text, type = 'success') => {
    let message = form.querySelector('.form-message');

    if (!message) {
      message = document.createElement('p');
      message.className = 'form-message';
      form.appendChild(message);
    }

    message.textContent = text;
    message.classList.remove('form-message--success', 'form-message--error');
    message.classList.add(`form-message--${type}`);
    message.classList.add('form-message--visible');

    window.clearTimeout(message._hideTimeout);
    message._hideTimeout = window.setTimeout(() => {
      message.classList.remove('form-message--visible');
    }, 5000);
  };

  const validateForm = (form) => {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      field.classList.remove('field--error');

      const value = field.value.trim();
      const isEmail = field.type === 'email';
      const isPhone = field.type === 'tel';

      if (!value) {
        isValid = false;
        field.classList.add('field--error');
        return;
      }

      if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        field.classList.add('field--error');
      }

      if (isPhone && value.replace(/\D/g, '').length < 10) {
        isValid = false;
        field.classList.add('field--error');
      }
    });

    return isValid;
  };

  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('field--error');
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm(form)) {
        showFormMessage(form, 'Пожалуйста, заполните все поля корректно.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"], .btn');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
      }

      // Имитация отправки на сервер
      setTimeout(() => {
        showFormMessage(
          form,
          'Спасибо! Ваша заявка принята — наш сомелье свяжется с вами в течение 24 часов.',
          'success'
        );
        form.reset();

        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }, 900);
    });
  });

  /* ---------------------------------------------------------
     8. ИНТЕРАКТИВНЫЙ КУРСОР (декоративный, для desktop)
  --------------------------------------------------------- */
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  if (!isTouchDevice) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor__dot';
    document.body.appendChild(cursorDot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverTargets = document.querySelectorAll(
      'a, button, .product-card, .btn, input, textarea'
    );

    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('custom-cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('custom-cursor--hover'));
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorD