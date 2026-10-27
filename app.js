/* Conoce a Dios — interacciones */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- barra de progreso ---------- */
  var bar = document.getElementById('progressBar');
  var ticking = false;

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ---------- dots: sección activa ---------- */
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dots a'));
  var sections = dots
    .map(function (d) {
      var id = d.getAttribute('data-dot');
      var el = document.getElementById(id);
      return el ? { id: id, el: el, dot: d } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};

    var dotObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      var bestId = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });

      sections.forEach(function (s) {
        s.dot.classList.toggle('is-active', s.id === bestId);
      });
    }, { threshold: [0, 0.15, 0.35, 0.55, 0.75, 1], rootMargin: '-10% 0px -10% 0px' });

    sections.forEach(function (s) { dotObserver.observe(s.el); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.sec .kicker, .sec h2, .sec .lead, .verse, .closing, .prayer, .steps li, .card, .visit-item, .identity li, .cta-row'
  );

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i % 6, 4) * 55 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- oración: Amén ---------- */
  var amenBtn = document.getElementById('amenBtn');
  var amenMsg = document.getElementById('amenMsg');

  if (amenBtn && amenMsg) {
    amenBtn.addEventListener('click', function () {
      var open = amenMsg.hasAttribute('hidden') === false;
      if (open) {
        amenMsg.setAttribute('hidden', '');
        amenBtn.setAttribute('aria-expanded', 'false');
        amenBtn.textContent = 'Amén, lo hice';
        return;
      }
      amenMsg.removeAttribute('hidden');
      amenBtn.setAttribute('aria-expanded', 'true');
      amenBtn.textContent = 'Amén';
      scheduleFit();
      amenMsg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- modal compartir + QR ---------- */
  var modal = document.getElementById('shareModal');
  var openBtn = document.getElementById('shareBtn');
  var closeBtn = document.getElementById('closeShare');
  var qrBox = document.getElementById('qrBox');
  var urlLabel = document.getElementById('shareUrl');
  var copyBtn = document.getElementById('copyBtn');
  var nativeBtn = document.getElementById('nativeBtn');
  var lastFocus = null;

  function pageUrl() {
    return window.location.href.split('#')[0];
  }

  function buildQR(text) {
    if (!qrBox) return;
    qrBox.innerHTML = '';

    if (typeof qrcode !== 'function') {
      qrBox.textContent = text;
      return;
    }

    try {
      /* Nivel H (30% de recuperación) para que el logo central
         no impida la lectura del código */
      var qr = qrcode(0, 'H');
      qr.addData(text);
      qr.make();

      var wrap = document.createElement('div');
      wrap.className = 'qr-inner';
      wrap.innerHTML = qr.createImgTag(5, 1);

      var img = wrap.querySelector('img');
      if (img) {
        img.alt = 'Código QR con el enlace a esta página';
      }

      var logo = document.createElement('span');
      logo.className = 'qr-logo';
      logo.innerHTML = '<img src="assets/logo.png" alt="">';

      wrap.appendChild(logo);
      qrBox.appendChild(wrap);
    } catch (e) {
      qrBox.textContent = text;
    }
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    var url = pageUrl();
    buildQR(url);
    if (urlLabel) urlLabel.textContent = url;

    modal.removeAttribute('hidden');
    modalOpen = true;
    document.body.style.overflow = 'hidden';

    if (navigator.share) {
      nativeBtn.hidden = false;
    }

    (closeBtn || modal).focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    modalOpen = false;
    document.body.style.overflow = '';
    refreshDeck();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = pageUrl();
      var done = function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = 'Enlace copiado';
        window.setTimeout(function () { copyBtn.textContent = prev; }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          copyBtn.textContent = 'No se pudo copiar';
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* noop */ }
        document.body.removeChild(ta);
      }
    });
  }

  if (nativeBtn) {
    nativeBtn.addEventListener('click', function () {
      if (!navigator.share) return;
      navigator.share({
        title: document.title,
        text: 'Conoce a Dios — un camino corto y claro para empezar.',
        url: pageUrl()
      }).catch(function () { /* usuario canceló */ });
    });
  }

  /* ============================================================
     Una página por pantalla (móvil / Safari iOS)
     1. --vh con el alto visible real, para que la barra de Safari
        no deje la sección corta ni desbordada.
     2. Corrección al soltar el scroll: siempre cae al inicio exacto
        de una sección, nunca a mitad de camino.
     ============================================================ */
  var fitTimer = null;
  var settleTimer = null;
  var isSnapping = false;
  var touchActive = false;
  var modalOpen = false;
  var deck = [];

  function isMobileDeck() {
    return window.matchMedia('(max-width: 820px)').matches;
  }

  function setViewportUnit() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }

  function fitSections() {
    setViewportUnit();

    var blocks = document.querySelectorAll('.hero, .sec');
    var mobile = isMobileDeck();
    deck = [];

    Array.prototype.forEach.call(blocks, function (sec) {
      sec.classList.remove('is-tall');
      if (!mobile) return;

      var inner = sec.querySelector('.sec-inner') || sec.querySelector('.hero-inner');
      if (!inner) return;

      var cs = window.getComputedStyle(sec);
      var pads = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      var foot = sec.querySelector('.foot');
      var footH = foot ? foot.getBoundingClientRect().height : 0;
      var needed = inner.getBoundingClientRect().height + pads + footH;

      /* Si el contenido excede una pantalla, la sección fluye normal */
      if (needed > window.innerHeight + 1) {
        sec.classList.add('is-tall');
      }
    });

    refreshDeck();
  }

  function refreshDeck() {
    if (!isMobileDeck()) { deck = []; return; }

    deck = Array.prototype.map.call(
      document.querySelectorAll('.hero, .sec'),
      function (el) {
        var rect = el.getBoundingClientRect();
        return {
          el: el,
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
          tall: el.classList.contains('is-tall')
        };
      }
    );
  }

  function snapCandidates() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var list = [];

    deck.forEach(function (s) {
      if (!s.tall) {
        list.push(s.top);
        return;
      }
      /* Sección más alta que la pantalla: solo se ancla al entrar
         o al llegar a su final, para poder leerla completa */
      if (Math.abs(s.top - y) < 130) list.push(s.top);
      var bottom = s.top + s.height - vh;
      if (Math.abs(bottom - y) < 130 && bottom > s.top) list.push(bottom);
    });

    return list;
  }

  function settleToSection() {
    if (!isMobileDeck() || touchActive || modalOpen || isSnapping || !deck.length) return;

    var y = window.scrollY;
    var vh = window.innerHeight;
    var candidates = snapCandidates();
    if (!candidates.length) return;

    var target = null;
    var best = Infinity;
    candidates.forEach(function (top) {
      var d = Math.abs(top - y);
      if (d < best) { best = d; target = top; }
    });

    /* Ya está alineado, o está tan lejos que el usuario va a mitad
       de una sección larga: no se toca */
    if (target === null || best < 6 || best > vh * 0.55) return;

    isSnapping = true;
    window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.setTimeout(function () { isSnapping = false; }, 750);
  }

  function scheduleSettle() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleToSection, 150);
  }

  function scheduleFit() {
    window.clearTimeout(fitTimer);
    fitTimer = window.setTimeout(fitSections, 120);
  }

  window.addEventListener('scroll', function () {
    if (isSnapping) return;
    scheduleSettle();
  }, { passive: true });

  document.addEventListener('touchstart', function () { touchActive = true; }, { passive: true });
  document.addEventListener('touchend', function () {
    touchActive = false;
    scheduleSettle();
  }, { passive: true });

  window.addEventListener('resize', scheduleFit);
  window.addEventListener('orientationchange', scheduleFit);
  window.addEventListener('load', function () { fitSections(); scheduleSettle(); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleFit);
  }
  fitSections();

  /* ---------- scroll suave con compensación ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();
