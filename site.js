// Kleanthis Mitsioulis: site behaviour. Plain JS, no build step.
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

  var year = document.getElementById('y');
  if (year) year.textContent = new Date().getFullYear();

  // ---- mobile menu disclosure ----
  (function () {
    var header = document.querySelector('.top');
    var btn = header && header.querySelector('.menu-btn');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    header.classList.add('js-menu');
    btn.hidden = false;
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      if (open && !reduced.matches && nav.animate) {
        nav.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE });
      }
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && btn.offsetParent) { set(false); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
  })();

  // ---- current section in nav ----
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var links = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  // ---- hero entrance (transform + opacity, once, only if the hero is on screen) ----
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero || reduced.matches || !hero.animate) return;
    if (hero.getBoundingClientRect().top > innerHeight || scrollY > innerHeight * 0.5) return;
    var steps = [
      ['.hn-1', 'translateY(24px)', 0],
      ['.hn-2', 'translateY(24px)', 80],
      ['.hero-tile', 'translateX(-24px)', 200],
      ['.hero-role', 'translateY(12px)', 260],
      ['.hero-tagline', 'translateY(12px)', 330],
      ['.hero-sub .actions', 'translateY(12px)', 400],
      ['.hero-meta', 'translateY(12px)', 470]
    ];
    steps.forEach(function (s) {
      var el = hero.querySelector(s[0]);
      if (!el) return;
      el.animate([{ opacity: 0, transform: s[1] }, { opacity: 1, transform: 'none' }],
        { duration: 640, delay: s[2], easing: EASE, fill: 'backwards' });
    });
  })();

  // ---- scroll reveals: rise | slide | slide-r | wipe | media; run once, never hide visible content ----
  function installReferenceReveals(root) {
    var animations = new Map();
    var active = true;
    var elements = [].slice.call(root.querySelectorAll('[data-reveal]'));
    var FROM = {
      rise: 'translateY(16px)', slide: 'translateX(-10px)', 'slide-r': 'translateX(10px)',
      wipe: 'scaleX(0)', media: 'translateY(20px)'
    };
    function finish(el) {
      el.dataset.revealPlayed = 'true';
      var a = animations.get(el);
      if (a) a.cancel();
      animations.delete(el);
    }
    var observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(function (entries) {
          if (!active) return;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            observer.unobserve(el);
            el.dataset.revealPlayed = 'true';
            if (reduced.matches || document.visibilityState === 'hidden' || entry.boundingClientRect.bottom <= 0) finish(el);
            else { var a = animations.get(el); if (a) a.play(); }
          });
        }, { threshold: 0, rootMargin: '0px 0px 96px 0px' })
      : null;
    function stop() { if (observer) observer.disconnect(); elements.forEach(finish); }
    function onPreference() { if (reduced.matches) stop(); }
    if (reduced.addEventListener) reduced.addEventListener('change', onPreference);
    elements.forEach(function (el) {
      if (el.dataset.revealPlayed === 'true') return;
      var rect = el.getBoundingClientRect();
      if (reduced.matches || !observer || !el.animate || rect.top < innerHeight || document.visibilityState === 'hidden') { finish(el); return; }
      var type = el.dataset.reveal;
      var frames = type === 'wipe'
        ? [{ transform: 'scaleX(0)' }, { transform: 'none' }]
        : [{ opacity: 0, transform: FROM[type] || FROM.rise }, { opacity: 1, transform: 'none' }];
      var a = el.animate(frames, {
        duration: type === 'wipe' ? 640 : type === 'media' ? 680 : 560,
        delay: Math.min(Number(el.dataset.revealDelay || 0), 240),
        easing: EASE, fill: 'backwards'
      });
      a.pause();
      a.onfinish = function () { finish(el); };
      animations.set(el, a);
      observer.observe(el);
    });
    return function () {
      active = false;
      if (observer) observer.disconnect();
      animations.forEach(function (a) { a.onfinish = null; a.cancel(); });
      animations.clear();
      if (reduced.removeEventListener) reduced.removeEventListener('change', onPreference);
    };
  }
  installReferenceReveals(document);

  // ---- travel map pins ----
  (function () {
    var out = document.getElementById('pindetail');
    var pins = [].slice.call(document.querySelectorAll('.map .pin'));
    if (!out || !pins.length) return;
    function pick(p) {
      pins.forEach(function (q) { q.classList.toggle('on', q === p); q.setAttribute('aria-pressed', String(q === p)); });
      var c = p.dataset.country;
      var n = pins.filter(function (q) { return q.dataset.country === c; }).length;
      out.textContent = '';
      var s = document.createElement('strong');
      s.textContent = p.dataset.city;
      out.appendChild(s);
      out.appendChild(document.createTextNode(', ' + c + (n > 1 ? ' · ' + n + ' cities visited here' : ' · only city visited here')));
    }
    var NS = 'http://www.w3.org/2000/svg';
    pins.forEach(function (p) {
      p.setAttribute('aria-pressed', 'false');
      // larger invisible hit target behind each pin
      var hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('class', 'pin-hit');
      hit.setAttribute('cx', p.getAttribute('cx'));
      hit.setAttribute('cy', p.getAttribute('cy'));
      hit.setAttribute('r', '12');
      hit.setAttribute('aria-hidden', 'true');
      p.parentNode.insertBefore(hit, p);
      hit.addEventListener('click', function () { pick(p); });
      p.addEventListener('click', function () { pick(p); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p); }
      });
    });
  })();

  // ---- gitflash: live numbers from the RubyGems and GitHub public APIs, cached for an hour ----
  (function () {
    var box = document.getElementById('gem-stats');
    if (!box || !window.fetch) return;
    var KEY = 'gitflash-stats', cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY)); } catch (e) {}
    if (cached && Date.now() - cached.at < 36e5) return show(cached);
    function get(u) { return fetch(u, { headers: { Accept: 'application/json' } }).then(function (r) { if (!r.ok) throw r; return r.json(); }); }
    Promise.all([
      get('https://rubygems.org/api/v1/gems/gitflash.json').catch(function () { return null; }),
      get('https://api.github.com/repos/Kleanthismits/git_flash').catch(function () { return null; })
    ]).then(function (r) {
      var s = { at: Date.now(), downloads: r[0] && r[0].downloads, version: r[0] && r[0].version, stars: r[1] && r[1].stargazers_count };
      try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
      show(s);
    });
    function show(s) {
      ['version', 'downloads', 'stars'].forEach(function (k) {
        var li = box.querySelector('[data-stat="' + k + '"]'), v = s[k];
        if (!li || v == null) return;
        li.querySelector('strong').textContent = k === 'version' ? 'v' + v : Number(v).toLocaleString('en');
        li.hidden = false;
        if (!reduced.matches && li.animate) li.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      });
    }
  })();

  // ---- gitflash: replay the demo transcript once it scrolls into view ----
  (function () {
    var term = document.querySelector('.term');
    if (!term || !('IntersectionObserver' in window) || reduced.matches) return;
    var body = term.querySelector('.term-body'), btn = term.querySelector('.term-btn');
    var lines = [].slice.call(body.querySelectorAll('.l'));
    var texts = lines.map(function (l) { return l.textContent; });
    var run = 0, timer;
    function reveal(l) {
      l.classList.remove('wait');
      var bottom = l.offsetTop + l.offsetHeight + 18;
      if (bottom > body.scrollTop + body.clientHeight) body.scrollTop = bottom - body.clientHeight;
    }
    function finish() {
      run++; clearTimeout(timer);
      lines.forEach(function (l, i) { l.textContent = texts[i]; l.classList.remove('wait', 'typing'); });
      body.removeAttribute('aria-busy'); btn.textContent = 'Replay';
    }
    function play() {
      var id = ++run, i = 0;
      clearTimeout(timer);
      lines.forEach(function (l) { l.classList.add('wait'); });
      body.scrollTop = 0; body.setAttribute('aria-busy', 'true'); btn.textContent = 'Skip';
      (function next() {
        if (id !== run) return;
        if (i >= lines.length) return finish();
        var l = lines[i], t = texts[i]; i++;
        if (l.classList.contains('p')) {
          var k = 0; l.textContent = ''; l.classList.add('typing'); reveal(l);
          (function type() {
            if (id !== run) return;
            l.textContent = t.slice(0, ++k);
            if (k < t.length) timer = setTimeout(type, 24);
            else { l.classList.remove('typing'); timer = setTimeout(next, 380); }
          })();
        } else { reveal(l); timer = setTimeout(next, l.classList.contains('c') ? 560 : 70); }
      })();
    }
    btn.hidden = false;
    btn.addEventListener('click', function () { body.hasAttribute('aria-busy') ? finish() : play(); });
    var started = false;
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !started) { started = true; io.disconnect(); play(); }
    }, { threshold: 0.35 });
    // only blank the transcript if the terminal is still below the fold
    if (term.getBoundingClientRect().top > innerHeight) {
      lines.forEach(function (l) { l.classList.add('wait'); });
      io.observe(term);
    }
    reduced.addEventListener && reduced.addEventListener('change', function () { if (reduced.matches) { io.disconnect(); finish(); } });
  })();
})();
