/**
 * Tarek Ghajary — Portfolio
 * Tabs, project cards, gallery carousel, theme toggle
 */
(function () {
  'use strict';

  // ---------- Theme ----------
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      themeBtn.title = mode === 'light' ? 'Dark mode' : 'Light mode';
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    applyTheme(saved === 'light' || saved === 'dark' ? saved : 'dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
  initTheme();

  // ---------- Tabs ----------
  var tabBtns = document.querySelectorAll('.tab-btn, button.tab, .tabs [data-tab]');
  var panels = document.querySelectorAll('.tab-panel');

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
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { activateTab(btn.dataset.tab); });
  });

  function applyHash() {
    var hash = (location.hash || '').replace(/^#/, '');
    if (!hash) return;
    var valid = Array.from(tabBtns).some(function (b) { return b.dataset.tab === hash; });
    if (valid) activateTab(hash);
  }
  window.addEventListener('hashchange', applyHash);
  applyHash();

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Projects (cards) ----------
  var REPO_CATEGORY = {
    Superstore_Sales_Analytics: 'analysis',
    KaggleSurveyAnalytics: 'analysis',
    StatisticsForDataScience: 'analysis',
    Houses_Prices_Prediction: 'ml',
    Loan_Status_Classification: 'ml',
    Analytics_of_The_Titanic_Disaster: 'analysis',
    BankAnalytics_ByGenAI: 'analysis',
    ECommerceDataAnalysis_ByDeepSeek: 'analysis',
    California_Houses_Analytics: 'analysis',
    Forecasting_Future_Sales: 'analysis',
    Market_Analysis: 'analysis',
    IBM_DataScience_Capstone: 'analysis',
    DataScienceExamples: 'analysis',
    DataScienceLibraries: 'analysis',
    Bokeh_Examples: 'analysis',
    LogisticsShippingRates: 'analysis',
    SkillsForAI: 'ml',
    PROPERTICA: 'web',
    SURVERA: 'web',
    STORICA: 'web',
    CHEQRPlayer: 'tools',
    CHEMDReader: 'tools',
    CHEEditor: 'tools',
    CHEChannel: 'tools',
    CHE_Rename_Files: 'tools',
    CHE_Resize_Images: 'tools',
    CHE_Functions: 'tools',
    Benifits: 'tools',
    SalesManager: 'tools',
    Google_Fonts: 'web',
    Coursera_GuidedProjects: 'other',
    'github-final-project': 'other'
  };

  var REPO_META = {
    Superstore_Sales_Analytics: { title: 'Superstore Sales Analytics', desc: 'End-to-end sales analytics with GenAI-assisted insights and executive summary.' },
    KaggleSurveyAnalytics: { title: 'Kaggle Survey Analytics', desc: 'Insights from Kaggle data science survey responses.' },
    StatisticsForDataScience: { title: 'Statistics for Data Science', desc: 'Core statistical methods applied in notebooks.' },
    Houses_Prices_Prediction: { title: 'House Prices Prediction', desc: 'Regression models for housing price prediction.' },
    Loan_Status_Classification: { title: 'Loan Status Classification', desc: 'Classification pipeline for loan approval status.' },
    Analytics_of_The_Titanic_Disaster: { title: 'Titanic Disaster Analytics', desc: 'Exploratory analysis and survival modeling on Titanic data.' },
    BankAnalytics_ByGenAI: { title: 'Bank Analytics (GenAI)', desc: 'Banking data analysis assisted by generative AI.' },
    ECommerceDataAnalysis_ByDeepSeek: { title: 'E-Commerce Analysis (DeepSeek)', desc: 'E-commerce metrics and insights with DeepSeek.' },
    California_Houses_Analytics: { title: 'California Houses Analytics', desc: 'Housing market analytics using GenAI workflows.' },
    Forecasting_Future_Sales: { title: 'Forecasting Future Sales', desc: 'Time-series style sales forecasting project.' },
    Market_Analysis: { title: 'Market Analysis', desc: 'Stocks and forex market analysis notebooks.' },
    IBM_DataScience_Capstone: { title: 'IBM Data Science Capstone', desc: 'Capstone project for the IBM Data Science certificate.' },
    SkillsForAI: { title: 'Skills for AI', desc: 'Learning path and experiments in AI fundamentals.' },
    PROPERTICA: { title: 'PROPERTICA', desc: 'Property-focused web application.' },
    SURVERA: { title: 'SURVERA', desc: 'Survey and feedback web product.' },
    STORICA: { title: 'STORICA', desc: 'Frontend product experience.' },
    CHEQRPlayer: { title: 'CHE QR Player', desc: 'Utility for QR-related workflows.' },
    CHEMDReader: { title: 'CHEMD Reader', desc: 'Document reader utility.' },
    CHEEditor: { title: 'CHE Editor', desc: 'Simple editor built with Python & Tkinter.' },
    Benifits: { title: 'Benefits Calculator', desc: 'App to calculate benefits.' },
    SalesManager: { title: 'Sales Manager', desc: 'Sales management utilities in Python.' },
    CHE_Rename_Files: { title: 'Rename Files', desc: 'PyQt5 GUI to rename files in batch.' },
    CHE_Resize_Images: { title: 'Resize Images', desc: 'Image resizing utility app.' }
  };

  var CATEGORY_ORDER = ['analysis', 'ml', 'web', 'tools', 'other'];
  var CATEGORY_LABEL = {
    analysis: 'Data Analysis',
    ml: 'Machine Learning',
    web: 'Web',
    tools: 'Tools & Apps',
    other: 'Other'
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, String.fromCharCode(38) + 'amp;')
      .replace(/</g, String.fromCharCode(38) + 'lt;')
      .replace(/>/g, String.fromCharCode(38) + 'gt;')
      .replace(/"/g, String.fromCharCode(38) + 'quot;');
  }

  function fetchWithTimeout(url, ms) {
    ms = ms || 8000;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(
      function (r) { clearTimeout(timer); return r; },
      function (err) { clearTimeout(timer); throw err; }
    );
  }

  function cardHtml(repo) {
    var name = repo.name;
    var meta = REPO_META[name] || {};
    var title = meta.title || name.replace(/_/g, ' ');
    var desc = meta.desc || repo.description || 'GitHub project';
    var cat = REPO_CATEGORY[name] || 'other';
    var stars = repo.stargazers_count || 0;
    var lang = repo.language || '';
    var label = (CATEGORY_LABEL && CATEGORY_LABEL[cat]) ? CATEGORY_LABEL[cat] : cat;
    return (
      '<article class="card project-card" data-category="' + escapeHtml(cat) + '">' +
        '<p class="card-title">' +
          '<a href="project.html?repo=' + encodeURIComponent(name) + '">' + escapeHtml(title) + '</a>' +
        '</p>' +
        '<p class="card-meta">' +
          '<span class="badge">' + escapeHtml(label) + '</span>' +
          (lang ? '<span class="badge">' + escapeHtml(lang) + '</span>' : '') +
          (stars ? '<span>' + stars + '★</span>' : '') +
        '</p>' +
        '<p class="card-desc">' + escapeHtml(desc) + '</p>' +
        '<div class="project-card-actions">' +
          '<a class="project-link" href="project.html?repo=' + encodeURIComponent(name) + '">Open README →</a>' +
          '<a class="project-link" href="https://github.com/CHESyrian/' + encodeURIComponent(name) + '" target="_blank" rel="noopener">GitHub ↗</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects(repos) {
    var root = document.getElementById('projects-root');
    if (!root) return;
    var loading = document.getElementById('projects-loading');
    if (loading) loading.remove();

    var list = (repos || []).filter(function (r) {
      return r && !r.fork && r.name !== 'CHESyrian.github.io';
    });

    if (!list.length) {
      root.innerHTML = '<p class="readme-status">No public repositories found. <a href="https://github.com/CHESyrian" target="_blank" rel="noopener">View GitHub →</a></p>';
      return;
    }

    list.sort(function (a, b) {
      var ca = CATEGORY_ORDER.indexOf(REPO_CATEGORY[a.name] || 'other');
      var cb = CATEGORY_ORDER.indexOf(REPO_CATEGORY[b.name] || 'other');
      if (ca < 0) ca = 99;
      if (cb < 0) cb = 99;
      if (ca !== cb) return ca - cb;
      return (b.stargazers_count || 0) - (a.stargazers_count || 0) || a.name.localeCompare(b.name);
    });

    var html = '';
    list.forEach(function (r) {
      html += cardHtml(r);
    });
    root.className = 'projects-grid';
    root.innerHTML = html;
  }

  function loadProjects() {
    var root = document.getElementById('projects-root');
    if (!root) return;

    var fallback = [
      { name: 'Superstore_Sales_Analytics', description: 'Sales analytics with GenAI', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'Houses_Prices_Prediction', description: 'Housing price prediction', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'Loan_Status_Classification', description: 'Loan status classification', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'Analytics_of_The_Titanic_Disaster', description: 'Titanic analytics', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'KaggleSurveyAnalytics', description: 'Kaggle survey insights', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'StatisticsForDataScience', description: 'Statistics notebooks', language: 'Jupyter Notebook', stargazers_count: 0, fork: false },
      { name: 'IBM_DataScience_Capstone', description: 'IBM DS capstone', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'PROPERTICA', description: 'Property web app', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'SURVERA', description: 'Survey product', language: 'Python', stargazers_count: 0, fork: false },
      { name: 'STORICA', description: 'Frontend product', language: 'JavaScript', stargazers_count: 0, fork: false },
      { name: 'CHEEditor', description: 'Python Tkinter editor', language: 'Python', stargazers_count: 1, fork: false },
      { name: 'CHE_Rename_Files', description: 'Batch rename GUI', language: 'Python', stargazers_count: 1, fork: false },
      { name: 'CHE_Resize_Images', description: 'Image resize app', language: 'Python', stargazers_count: 1, fork: false },
      { name: 'Market_Analysis', description: 'Stocks and forex analysis', language: 'Jupyter Notebook', stargazers_count: 1, fork: false },
      { name: 'Forecasting_Future_Sales', description: 'Sales forecasting', language: 'Jupyter Notebook', stargazers_count: 1, fork: false }
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
      if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
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

    var startX = 0;
    carousel.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next(); else prev();
        restartAuto();
      }
    }, { passive: true });

    goTo(0);
    restartAuto();
  })();
})();
