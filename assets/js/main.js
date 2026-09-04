/* ============================================================================
   main.js — language switching, navigation, scroll reveal, contact form
   Depends on: assets/js/content.js (global CONTENT)
   ========================================================================== */
(function () {
  'use strict';

  var DEFAULT_LANG = 'lv';
  var STORAGE_KEY  = 'bffe-lang';
  var EMAIL        = 'info@balticfoundation.lv';

  /* ---------------------------------------------------------------- i18n -- */

  function t(key, lang) {
    var dict = CONTENT[lang] || CONTENT[DEFAULT_LANG];
    return dict[key] !== undefined ? dict[key] : (CONTENT[DEFAULT_LANG][key] || '');
  }

  function applyLang(lang) {
    if (!CONTENT[lang]) lang = DEFAULT_LANG;

    document.documentElement.lang = lang;

    // Plain text nodes
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), lang);
    });

    // Text that intentionally contains markup (e.g. <br>)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), lang);
    });

    // Attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'), lang);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label'), lang));
    });

    // Document metadata
    document.title = t('meta.title', lang);
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description', lang));

    // Switcher state
    document.querySelectorAll('.lang button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function initialLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && CONTENT[stored]) return stored;

    var param = new URLSearchParams(location.search).get('lang');
    if (param && CONTENT[param]) return param;

    // Latvian stays the default unless the browser clearly prefers English
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('lv') === 0) return 'lv';
    if (nav.indexOf('en') === 0) return 'en';
    return DEFAULT_LANG;
  }

  document.querySelectorAll('.lang button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  applyLang(initialLang());

  /* ------------------------------------------------------------- header -- */

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobile-nav');

  function onScroll() {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
    } else {
      burger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  });

  mobileNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      burger.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1240) closeMenu();
  });

  /* ------------------------------------------------------ scroll reveal -- */

  var revealables = document.querySelectorAll('.reveal, .reveal-stagger');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* -------------------------------------------------------- contact form -- */

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var lang    = document.documentElement.lang;
    var name    = form.name.value.trim();
    var email   = form.email.value.trim();
    var subject = form.subject.value.trim();
    var message = form.message.value.trim();

    if (!name || !email || !message) {
      status.textContent = t('form.required', lang);
      status.setAttribute('data-state', 'error');
      (!name ? form.name : !email ? form.email : form.message).focus();
      return;
    }

    var body = message + '\n\n—\n' + name + '\n' + email;
    var href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject || (name + ' — ' + t('partner.title', lang))) +
      '&body=' + encodeURIComponent(body);

    window.location.href = href;

    status.textContent = t('form.ok', lang);
    status.removeAttribute('data-state');
  });

})();
