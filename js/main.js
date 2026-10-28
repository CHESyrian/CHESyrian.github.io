/**
 * Tarek Ghajary — Portfolio
 * Tabs, accordion, gallery carousel, theme toggle, dynamic GitHub projects
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
    } else {
      applyTheme('dark');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
  initTheme();

  // ---------- Tabs ----------
  const tabBtns = document.querySelectorAll('.tab-btn, button.tab, .tabs [data-tab]');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(id) {
    if (!id) return;
    tabBtns.forEach(function (btn) {
      var active = btn.dataset.tab === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      var match = panel.id === 'panel-' + id;
      panel.classList.toggle('active', match);
      if (match) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
    try {
      history.replaceState(null, '', '#' + id);
    } catch (e) {}
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.dataset.tab);
    });
  });

  // Hash navigation
  function applyHash() {
    var hash = (location.hash || '').replace(/^#/, '');
    if (!hash) return;
    var valid = Array.from(tabBtns).some(function (b) {
      return b.dataset.tab === hash;
    });
    if (valid) activateTab(hash);
  }
  window.addEventListener('hashchange', applyHash);
  applyHash();

  // Year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Projects (GitHub) ----------
  var REPO_CATEGORY = {
    Superstore_Sales_Analytics: 'analysis',
    KaggleSurveyAnalytics: 'analysis',
    StatisticsForDataScience: 'analysis',
    SkillsForAI: 'ml',
    CHEQRPlayer: 'tools',
    PROPERTICA: 'web',
    SURVERA: 'web',
    STORICA: 'web',
    CHEMDReader: 'tools',
    'Portfolio-Website': 'web'
  };
  var REPO_META = {
    Superstore_Sales_Analytics: { title: 'Superstore Sales Analytics', desc: 'End-to-end sales analysis with forecasting and executive summary.' },
    KaggleSurveyAnalytics: { title: 'Kaggle Survey Analytics', desc: 'Insights from Kaggle data science survey responses.' },
    StatisticsForDataScience: { title: 'Statistics for Data Science', desc: 'Core statistical methods applied to real datasets.' },
    SkillsForAI: { title: 'Skills for AI', desc: 'Learning path and experiments in AI fundamentals.' },
    CHEQRPlayer: { title: 'CHE QR Player', desc: 'Utility tool for QR-related workflows.' },
    PROPERTICA: { title: 'PROPERTICA', desc: 'Property-focused web application.' },
    SURVERA: { title: 'SURVERA', desc: 'Survey and feedback web product.' },
    STORICA: { title: 'STORICA', desc: 'Frontend product experience.' },
    CHEMDReader: { title: 'CHEMD Reader', desc: 'Document reader utility.' }
  };
  var CATEGORY_ORDER = ['analysis', 'ml', 'web', 'tools', 'other'];
  var CATEGORY_LABEL = {
    analysis: 'Analysis',
    ml: 'ML / CV',
    web: 'Web',
    tools: 'Tools',
    other: 'Other',
    desktop: 'Desktop'
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, String.fromCharCode(38) + 'amp;')
      .replace(/</g, String.fromCharCode(38) + 'lt;')
      .replace(/>/g, String.fromCharCode(38) + 'gt;')
      .replace(/"/g, String.fromCharCode(38) + 'quot;');
  }

  function fetchWithTimeout(url, ms) {
    ms = ms || 8000;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    var opts = ctrl ? { signal: ctrl.signal } : {};
    return fetch(url, opts).then(function (r) {
      clearTimeout(timer);
      return r;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function cardHtml(repo) {
    var name = repo.name;
    var meta = REPO_META[name] || {};
    var title = meta.title || name.replace(/_/g, ' ');
    var desc = meta.desc || repo.description || 'GitHub project';
    var cat = REPO_CATEGORY[name] || 'other';
    var stars = repo.stargazers_count || 0;
    var lang = repo.language || '';
    return (
      '<div class="accordion-item" data-category="' + escapeHtml(cat) + '">' +
        '<button type="button" class="accordion-header" aria-expanded="false">' +
          '<span class="accordion-header-left">' +
            '<span class="accordion-icon">▸</span>' +
            '<span class="card-title">' + escapeHtml(title) + '</span>' +
          '</span>' +
          '<span class="accordion-count">' + (lang ? escapeHtml(lang) + ' · ' : '') + stars + '★</span>' +
        '</button>' +
        '<div class="accordion-body" hidden>' +
          '<p class="card-desc">' + escapeHtml(desc) + '</p>' +
          '<a class="project-link" href="project.html?repo=' + encodeURIComponent(name) + '">Open README →</a>' +
          ' <a class="project-link" href="https://github.com/CHESyrian/' + encodeURIComponent(name) + '" target="_blank" rel="noopener">GitHub ↗</a>' +
        '</div>' +
      '</div>'
    );
  }

  function renderProjects(repos) {
    var root = document.getElementById('projects-root');
    if (!root) return;
    var loading = document.getElementById('projects-loading');
    if (loading) loading.remove();
    if (!repos || !repos.length) {
      root.innerHTML = '<p class="readme-status">No public repositories found.</p>';
      return;
    }
    // sort by category order then name
    repos = repos.slice().sort(function (a, b) {
      var ca = CATEGORY_ORDER.indexOf(REPO_CATEGORY[a.name] || 'other');
      var cb = CATEGORY_ORDER.indexOf(REPO_CATEGORY[b.name] || 'other');
      if (ca < 0) ca = 99;
      if (cb < 0) cb = 99;
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });
    var html = '';
    repos.forEach(function (r) {
      if (r.fork) return;
      if (r.name === 'CHESyrian.github.io') return;
      html += cardHtml(r);
    });
    root.innerHTML = html || '<p class="readme-status">No projects to show.</p>';

    root.querySelectorAll('.accordion-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.accordion-item');
        var body = item.querySelector('.accordion-body');
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        item.classList.toggle('open', !open);
        if (body) {
          if (open) body.setAttribute('hidden', '');
          else body.removeAttribute('hidden');
        }
      });
    });
  }

  function loadProjects() {
    var root = document.getElementById('projects-root');
    if (!root) return;
    var fallback = [
      { name: 'Superstore_Sales_Analytics', description: 'Sales analytics pipeline', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'KaggleSurveyAnalytics', description: 'Kaggle survey insights', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'StatisticsForDataScience', description: 'Statistics notebooks', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'SkillsForAI', description: 'AI skills path', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'CHEQRPlayer', description: 'QR utility', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'PROPERTICA', description: 'Property web app', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'SURVERA', description: 'Survey product', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'STORICA', description: 'Frontend product', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'CHEMDReader', description: 'Document reader', language: 'Python', stargazers_count: 0, fork: false }
    ];
    fetchWithTimeout('https://api.github.com/users/CHESyrian/repos?per_page=100&sort=updated', 8000)
      .then(function (r) {
        if (!r.ok) throw new Error('API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length) renderProjects(data);
        else renderProjects(fallback);
      })
      .catch(function () {
        renderProjects(fallback);
      });
  }

  loadProjects();

  // ---------- Carousel ----------
  (function initCarousel() {
    var carousel = document.querySelector('.carousel');
    if (!carousel) return;
    var track = carousel.querySelector('.carousel-track');
    var slides = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
    if (!slides.length) return;
    var prevBtn = carousel.querySelector('.carousel-prev, .carousel-btn.prev');
    var nextBtn = carousel.querySelector('.carousel-next, .carousel-btn.next');
    var counter = document.getElementById('carousel-counter') || carousel.querySelector('.carousel-counter');
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var index = 0;
    var timer = null;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      if (track) track.style.transform = 'translateX(-' + index * 100 + '%)';
      if (counter) counter.textContent = index + 1 + ' / ' + slides.length;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach(function (d, di) {
          d.classList.toggle('active', di === index);
        });
      }
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    function restartAuto() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    if (dotsWrap && !dotsWrap.children.length) {
      slides.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); restartAuto(); });
        dotsWrap.appendChild(b);
      });
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAuto(); });

    // touch
    var startX = 0;
    carousel.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
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
})();
