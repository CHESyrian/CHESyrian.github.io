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

  // ---------- Accordion (static + dynamic) ----------
  function bindAccordion(rootEl) {
    var scope = rootEl || document;
    scope.querySelectorAll('.accordion-header').forEach(function (header) {
      if (header.dataset.bound === '1') return;
      header.dataset.bound = '1';
      header.addEventListener('click', function () {
        var item = header.closest('.accordion-item');
        if (!item) return;
        var isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });
  }
  bindAccordion(document);

  // ---------- Dynamic projects from GitHub ----------
  var OWNER = 'CHESyrian';
  var CATEGORY_ORDER = [
    { key: 'analysis', icon: '📊', title: 'Data Analysis' },
    { key: 'ml', icon: '🤖', title: 'Machine Learning & Data Science' },
    { key: 'web', icon: '🌐', title: 'Web Applications' },
    { key: 'desktop', icon: '💻', title: 'Desktop Applications' },
    { key: 'tools', icon: '🛠️', title: 'Tools & Utilities' },
    { key: 'other', icon: '📁', title: 'Other' }
  ];

  var REPO_CATEGORY = {
    Superstore_Sales_Analytics: 'analysis',
    BankAnalytics_ByGenAI: 'analysis',
    ECommerceDataAnalysis_ByDeepSeek: 'analysis',
    California_Houses_Analytics: 'analysis',
    Market_Analysis: 'analysis',
    Analytics_of_The_Titanic_Disaster: 'analysis',
    Loan_Status_Classification: 'ml',
    Houses_Prices_Prediction: 'ml',
    Forecasting_Future_Sales: 'ml',
    IBM_DataScience_Capstone: 'ml',
    Coursera_GuidedProjects: 'ml',
    DataScienceExamples: 'ml',
    DataScienceLibraries: 'ml',
    Bokeh_Examples: 'ml',
    PROPERTICA: 'web',
    SURVERA: 'web',
    FINALYZ: 'web',
    CHEMDReader: 'web',
    'CHESyrian.github.io': 'web',
    STORICA: 'desktop',
    SalesManager: 'desktop',
    CHE_Rename_Files: 'desktop',
    CHEEditor: 'desktop',
    Benifits: 'desktop',
    CyberSecuritySeries: 'tools',
    CHE_Functions: 'tools',
    CHE_Resize_Images: 'tools',
    LogisticsShippingRates: 'tools',
    Google_Fonts: 'tools',
    'github-final-project': 'tools',
    CHEChannel: 'tools'
  };

  var REPO_META = {
    Superstore_Sales_Analytics: { title: 'Superstore Sales Analytics', desc: 'Sales analytics with GenAI and classical tools.' },
    BankAnalytics_ByGenAI: { title: 'Bank Analytics by GenAI', desc: 'Banking data analysis with generative AI.' },
    ECommerceDataAnalysis_ByDeepSeek: { title: 'E-Commerce Data Analysis', desc: 'E-commerce analysis with DeepSeek.' },
    California_Houses_Analytics: { title: 'California Houses Analytics', desc: 'Housing data analytics with GenAI.' },
    Market_Analysis: { title: 'Market Analysis', desc: 'Stocks and forex analysis.' },
    Analytics_of_The_Titanic_Disaster: { title: 'Titanic Disaster Analytics', desc: 'Classic Titanic dataset analysis.' },
    Loan_Status_Classification: { title: 'Loan Status Classification', desc: 'ML classification of loan status.' },
    Houses_Prices_Prediction: { title: 'House Prices Prediction', desc: 'Regression models for house prices.' },
    Forecasting_Future_Sales: { title: 'Forecasting Future Sales', desc: 'Time-series sales forecasting.' },
    IBM_DataScience_Capstone: { title: 'IBM Data Science Capstone', desc: 'IBM professional certificate capstone.' },
    Coursera_GuidedProjects: { title: 'Coursera Guided Projects', desc: 'Guided data science projects.' },
    DataScienceExamples: { title: 'Data Science Examples', desc: 'Python data science examples.' },
    DataScienceLibraries: { title: 'Data Science Libraries', desc: 'Examples of common DS packages.' },
    Bokeh_Examples: { title: 'Bokeh Examples', desc: 'Interactive plots with Bokeh.' },
    PROPERTICA: { title: 'PROPERTICA', desc: 'Real estate listings marketplace.' },
    SURVERA: { title: 'SURVERA', desc: 'Survey platform with XP and analytics.' },
    FINALYZ: { title: 'FINALYZ', desc: 'Financial ratios and DuPont analysis.' },
    CHEMDReader: { title: 'CHEMDReader', desc: 'Markdown reader application.' },
    'CHESyrian.github.io': { title: 'This Portfolio Site', desc: 'Personal portfolio on GitHub Pages.' },
    STORICA: { title: 'STORICA', desc: 'Desktop history / records app.' },
    SalesManager: { title: 'Sales Manager', desc: 'Sales management desktop app.' },
    CHE_Rename_Files: { title: 'CHE Rename Files', desc: 'Batch rename files (PyQt5 GUI).' },
    CHEEditor: { title: 'CHE Editor', desc: 'Simple editor with Python & Tkinter.' },
    Benifits: { title: 'Benefits Calculator', desc: 'App to calculate benefits.' },
    CyberSecuritySeries: { title: 'Cyber Security Series', desc: 'Cybersecurity learning series.' },
    CHE_Functions: { title: 'CHE Functions', desc: 'Shared helper functions for repos.' },
    CHE_Resize_Images: { title: 'CHE Resize Images', desc: 'Image resize utility.' },
    LogisticsShippingRates: { title: 'Logistics Shipping Rates', desc: 'Shipping rate calculations.' },
    Google_Fonts: { title: 'Google Fonts (offline)', desc: 'Offline font package for front-end.' },
    'github-final-project': { title: 'GitHub Final Project', desc: 'IBM Git and GitHub course project.' },
    CHEChannel: { title: 'CHE Channel', desc: 'CHE Channel project.' }
  };

  function badgeFromLanguage(lang) {
    if (!lang) return 'Repo';
    if (lang === 'Jupyter Notebook') return 'Jupyter';
    return lang;
  }

  function prettyName(name) {
    if (REPO_META[name] && REPO_META[name].title) return REPO_META[name].title;
    return name.replace(/_/g, ' ');
  }

  function describe(repo) {
    if (REPO_META[repo.name] && REPO_META[repo.name].desc) return REPO_META[repo.name].desc;
    if (repo.description) return repo.description;
    return 'Public repository on GitHub.';
  }

  function categorize(repo) {
    if (REPO_CATEGORY[repo.name]) return REPO_CATEGORY[repo.name];
    var lang = repo.language || '';
    if (lang === 'Jupyter Notebook') return 'ml';
    if (lang === 'HTML' || lang === 'CSS' || lang === 'JavaScript' || lang === 'TypeScript') return 'web';
    if (lang === 'Python') return 'tools';
    return 'other';
  }

  function fetchWithTimeout(url, ms) {
    ms = ms || 12000;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    var opts = {};
    if (controller) {
      opts.signal = controller.signal;
      timer = setTimeout(function () {
        try { controller.abort(); } catch (e) {}
      }, ms);
    }
    return fetch(url, opts).then(function (r) {
      if (timer) clearTimeout(timer);
      return r;
    }).catch(function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function cardHtml(repo) {
    var name = repo.name;
    var title = prettyName(name);
    var badge = badgeFromLanguage(repo.language);
    var desc = describe(repo);
    var href = 'project.html?repo=' + encodeURIComponent(name);
    return (
      '<article class="card project-card">' +
      '<p class="card-title"><a href="' + href + '">' + escapeHtml(title) + '</a></p>' +
      '<p class="card-meta"><span class="badge">' + escapeHtml(badge) + '</span></p>' +
      '<p class="card-desc">' + escapeHtml(desc) + '</p>' +
      '<a class="project-link" href="' + href + '">View README</a>' +
      '</article>'
    );
  }

  function chevronSvg() {
    return '<svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
  }

  function renderProjects(repos) {
    var rootEl = document.getElementById('projects-root');
    if (!rootEl) return;

    var groups = {};
    CATEGORY_ORDER.forEach(function (c) { groups[c.key] = []; });
    repos.forEach(function (repo) {
      if (repo.fork) return;
      var key = categorize(repo);
      if (!groups[key]) groups[key] = [];
      groups[key].push(repo);
    });

    Object.keys(groups).forEach(function (k) {
      groups[k].sort(function (a, b) {
        return prettyName(a.name).localeCompare(prettyName(b.name));
      });
    });

    var html = '';
    var firstOpen = true;
    CATEGORY_ORDER.forEach(function (cat) {
      var list = groups[cat.key] || [];
      if (!list.length) return;
      var open = firstOpen;
      firstOpen = false;
      html +=
        '<div class="accordion-item' + (open ? ' open' : '') + '">' +
        '<button type="button" class="accordion-header" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        '<span class="accordion-header-left"><span class="accordion-icon">' + cat.icon + '</span>' +
        '<span class="accordion-title">' + cat.title + '</span></span>' +
        '<span style="display:flex;align-items:center;gap:0.65rem"><span class="accordion-count">' +
        list.length +
        '</span>' +
        chevronSvg() +
        '</span></button>' +
        '<div class="accordion-body"><div class="projects-grid">' +
        list.map(cardHtml).join('') +
        '</div></div></div>';
    });

    if (!html) {
      rootEl.innerHTML =
        '<p class="readme-status error">No public repositories found. <a href="https://github.com/' +
        OWNER +
        '" target="_blank" rel="noopener">Open GitHub</a></p>';
      return;
    }

    rootEl.innerHTML = html;
    bindAccordion(rootEl);
  }

  function buildFallbackRepos() {
    return Object.keys(REPO_CATEGORY).map(function (name) {
      return {
        name: name,
        fork: false,
        language: null,
        description: (REPO_META[name] && REPO_META[name].desc) || ''
      };
    });
  }

  function loadProjects() {
    var rootEl = document.getElementById('projects-root');
    if (!rootEl) return;

    renderProjects(buildFallbackRepos());

    var url =
      'https://api.github.com/users/' +
      OWNER +
      '/repos?per_page=100&sort=updated';

    fetchWithTimeout(url, 8000)
      .then(function (r) {
        if (!r.ok) throw new Error('GitHub API ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!Array.isArray(data) || !data.length) return;
        renderProjects(data);
      })
      .catch(function (err) {
        console.warn('GitHub API unavailable, using cached project list', err);
      });
  }

  loadProjects();

  // ---------- Gallery carousel ----------
  var carousel = document.querySelector('.carousel');
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
