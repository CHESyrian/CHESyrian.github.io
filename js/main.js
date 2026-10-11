/**
 * Tarek Ghajary — Portfolio
 * Tabs, accordion, gallery carousel, theme toggle
 */
(function () {
  'use strict';

  // ---------- Theme ----------
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem('theme', mode);
    } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      themeBtn.title = mode === 'light' ? 'Dark mode' : 'Light mode';
    }
  }

  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch (e) {}
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }
  }

  initTheme();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

  // ---------- Tabs ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(id) {
    tabBtns.forEach(function (btn) {
      var active = btn.dataset.tab === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      panel.classList.toggle('active', panel.id === 'panel-' + id);
    });
    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.dataset.tab);
    });
  });

  var hash = (location.hash || '#about').slice(1);
  var valid = Array.from(tabBtns).some(function (b) {
    return b.dataset.tab === hash;
  });
  activateTab(valid ? hash : 'about');

  // ---------- Accordion ----------
  document.querySelectorAll('.accordion-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var item = header.closest('.accordion-item');
      if (!item) return;
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  // ---------- Gallery carousel ----------
  var carousel = document.querySelector('.gallery-carousel');
  if (!carousel) return;

  var track = carousel.querySelector('.carousel-track');
  if (!track) return;

  var slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  var prevBtn = carousel.querySelector('.carousel-prev');
  var nextBtn = carousel.querySelector('.carousel-next');
  var dotsWrap = carousel.querySelector('.carousel-dots');
  var index = 0;
  var timer = null;

  if (!slides.length) return;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () {
      goTo(i);
      restartAuto();
    });
    dotsWrap.appendChild(dot);
  });

  var dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

  var counterEl = document.getElementById('carousel-counter');
  var progressEl = document.getElementById('carousel-progress-bar');

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    slides.forEach(function (s, n) {
      s.classList.toggle('active', n === index);
    });
    dots.forEach(function (d, n) {
      d.classList.toggle('active', n === index);
    });
    if (counterEl) {
      counterEl.textContent = (index + 1) + ' / ' + slides.length;
    }
    if (progressEl) {
      progressEl.style.width = ((index + 1) / slides.length * 100) + '%';
    }
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAuto(); });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { next(); restartAuto(); }
    if (e.key === 'ArrowLeft') { prev(); restartAuto(); }
  });

  function restartAuto() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  carousel.addEventListener('mouseenter', function () {
    if (timer) clearInterval(timer);
  });
  carousel.addEventListener('mouseleave', restartAuto);

  var startX = 0;
  track.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].screenX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
      restartAuto();
    }
  }, { passive: true });

  goTo(0);
  restartAuto();
})();
