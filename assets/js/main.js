/* Safar Journeys — interactions */
(function () {
  'use strict';

  /* ---------- sticky header ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('on');
      nav.classList.toggle('on');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        burger.classList.remove('on');
        nav.classList.remove('on');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- accordion ---------- */
  document.querySelectorAll('.acc__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement;
      var wasOn = item.classList.contains('on');
      item.parentElement.querySelectorAll('.acc').forEach(function (a) {
        a.classList.remove('on');
      });
      if (!wasOn) item.classList.add('on');
    });
  });

  /* ---------- destination / package filter chips ---------- */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var key = group.getAttribute('data-filter-group');
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var val = chip.getAttribute('data-val');
      document.querySelectorAll('[data-' + key + ']').forEach(function (item) {
        var raw = item.getAttribute('data-' + key) || '';
        var tokens = raw.split(/\s+/);
        var hit = val === 'all' || tokens.indexOf(val) !== -1;
        item.style.display = hit ? '' : 'none';
      });
      var empty = document.querySelector('[data-empty="' + key + '"]');
      if (empty) {
        var any = Array.prototype.some.call(
          document.querySelectorAll('[data-' + key + ']'),
          function (i) { return i.style.display !== 'none'; }
        );
        empty.style.display = any ? 'none' : 'block';
      }
    });
  });

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var dur = 1400;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val).toLocaleString('en-IN')) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- enquiry forms ---------- */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validPhone(v) { return /^[+\d][\d\s\-()]{7,}$/.test(v); }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll('[required]').forEach(function (input) {
        var wrap = input.closest('.form__group');
        var val = (input.value || '').trim();
        var good = val.length > 0;
        if (good && input.type === 'email') good = validEmail(val);
        if (good && input.getAttribute('data-phone')) good = validPhone(val);
        if (wrap) wrap.classList.toggle('bad', !good);
        if (!good) ok = false;
      });

      if (!ok) {
        var firstBad = form.querySelector('.form__group.bad input, .form__group.bad select, .form__group.bad textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      setTimeout(function () {
        var box = form.querySelector('.form__ok');
        if (box) {
          var nameEl = form.querySelector('[name="name"]');
          var nm = nameEl && nameEl.value.trim() ? nameEl.value.trim().split(' ')[0] : 'there';
          box.textContent = 'Thank you, ' + nm + '. Your enquiry is with our travel desk — you will hear back within one working day.';
          box.classList.add('show');
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }, 900);
    });

    form.querySelectorAll('input,select,textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        var wrap = input.closest('.form__group');
        if (wrap) wrap.classList.remove('bad');
      });
    });
  });

  /* ---------- search bar -> contact prefills ---------- */
  var searchForm = document.querySelector('[data-search]');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var dest = searchForm.querySelector('[name="destination"]');
      var month = searchForm.querySelector('[name="month"]');
      var pax = searchForm.querySelector('[name="travellers"]');
      var params = new URLSearchParams();
      if (dest && dest.value) params.set('destination', dest.value);
      if (month && month.value) params.set('month', month.value);
      if (pax && pax.value) params.set('travellers', pax.value);
      window.location.href = 'contact.html?' + params.toString();
    });
  }

  /* ---------- prefill contact from query string ---------- */
  if (/contact\.html/.test(window.location.pathname)) {
    var q = new URLSearchParams(window.location.search);
    [['destination', 'Destination'], ['month', 'Travel month'], ['travellers', 'Travellers']].forEach(function (pair) {
      var v = q.get(pair[0]);
      if (!v) return;
      var el = document.querySelector('[name="' + pair[0] + '"]');
      if (el) {
        if (el.tagName === 'SELECT') {
          var match = Array.prototype.find.call(el.options, function (o) {
            return o.value === v || o.textContent.trim() === v;
          });
          if (match) el.value = match.value;
        } else {
          el.value = v;
        }
      }
    });
  }

  /* ---------- year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
