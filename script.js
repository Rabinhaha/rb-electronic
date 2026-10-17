(function () {
  'use strict';

  var WHATSAPP_NUMBER = '9779841856312';
  var FALLBACK_IMG = 'assets/images/fallback.svg';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('main-nav');
  var toggle = document.querySelector('.nav-toggle');

  /* ---------- Sticky header shadow ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      setMenu(false);
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && nav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Smooth scrolling for in-page links ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    setMenu(false);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = id === '#home' ? 0 : target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      btn.closest('.faq-item').classList.toggle('is-open', !open);
    });
  });

  /* ---------- Image fallbacks ---------- */
  function useFallback(img) {
    if (img.dataset.failed) return;
    img.dataset.failed = '1';
    img.classList.add('img-failed');
    img.src = FALLBACK_IMG;
  }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () { useFallback(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) useFallback(img);
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- WhatsApp enquiry form ---------- */
  var form = document.getElementById('enquiry-form');
  if (form) {
    var status = document.getElementById('form-status');
    var fields = {
      type: { el: form.elements.type, error: 'Please choose your vehicle type.' },
      make: { el: form.elements.make, error: 'Please enter the vehicle make.' },
      model: { el: form.elements.model, error: 'Please enter the vehicle model.' }
    };

    function setError(name, message) {
      var f = fields[name];
      var box = document.getElementById('e-' + name);
      box.textContent = message || '';
      f.el.closest('.field').classList.toggle('has-error', !!message);
      if (message) f.el.setAttribute('aria-invalid', 'true');
      else f.el.removeAttribute('aria-invalid');
    }

    Object.keys(fields).forEach(function (name) {
      fields[name].el.addEventListener('input', function () { setError(name, ''); });
      fields[name].el.addEventListener('change', function () { setError(name, ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      Object.keys(fields).forEach(function (name) {
        var value = fields[name].el.value.trim();
        if (!value) {
          setError(name, fields[name].error);
          if (!firstInvalid) firstInvalid = fields[name].el;
        } else {
          setError(name, '');
        }
      });

      if (firstInvalid) {
        status.textContent = '';
        firstInvalid.focus();
        return;
      }

      var lines = [
        'Hello R&B Electronic, I would like to ask about Exide battery availability and compatibility for my vehicle.',
        '',
        'Vehicle type: ' + fields.type.el.value.trim(),
        'Make: ' + fields.make.el.value.trim(),
        'Model: ' + fields.model.el.value.trim()
      ];
      var msg = form.elements.message.value.trim();
      if (msg) lines.push('Message: ' + msg);

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      // window.open returns null when 'noopener' is passed, so detach the opener manually
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;

      status.textContent = 'WhatsApp has been opened with your enquiry. Press send in WhatsApp to deliver your message.';
    });
  }
})();
