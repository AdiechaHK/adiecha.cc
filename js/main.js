/* =========================================
   VISHWAKARMA PARIVAR - Main JavaScript
   ========================================= */

/* ── i18n Engine ──────────────────────────── */
const SUPPORTED_LANGS = ['en', 'hi', 'gu'];
const STORAGE_KEY = 'vk_lang';

function cacheEnglishDefaults() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.dataset.i18nEn = el.textContent;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.dataset.i18nHtmlEn = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.dataset.i18nPhEn = el.placeholder;
  });
}

function applyTranslations(t, lang) {
  if (lang === 'en' || !t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.i18nEn !== undefined) el.textContent = el.dataset.i18nEn;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      if (el.dataset.i18nHtmlEn !== undefined) el.innerHTML = el.dataset.i18nHtmlEn;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      if (el.dataset.i18nPhEn !== undefined) el.placeholder = el.dataset.i18nPhEn;
    });
    return;
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t[el.dataset.i18nHtml];
    if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = t[el.dataset.i18nPlaceholder];
    if (v !== undefined) el.placeholder = v;
  });
}

async function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'en';
  let t = null;
  if (lang !== 'en') {
    try {
      const res = await fetch('locales/' + lang + '.json');
      if (res.ok) t = await res.json();
    } catch (e) {
      console.warn('Could not load', lang, 'translations');
    }
  }
  applyTranslations(t, lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

function initLanguage() {
  cacheEnglishDefaults();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved) && saved !== 'en') {
    setLanguage(saved);
  } else {
    // mark EN button active
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === 'en');
    });
  }
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // ── Init language ─────────────────────────
  initLanguage();

  // ── Mobile menu ─────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // ── Header scroll effect ─────────────────
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Active nav link ───────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Back to top ───────────────────────────
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 350);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── AOS init ──────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }

  // ── Counter animation ─────────────────────
  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();
    const isSuffix  = el.dataset.suffix || '';
    const isPrefix  = el.dataset.prefix || '';

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const value = Math.floor(progress * target);
      el.textContent = isPrefix + value.toLocaleString() + isSuffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count, 10);
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // ── Contact form ──────────────────────────
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn-submit');
      const original = btn.innerHTML;

      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = '#22c55e';
      btn.style.borderColor = '#22c55e';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
        contactForm.reset();
      }, 3500);
    });
  }

  // ── Smooth scroll for hash links ──────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
