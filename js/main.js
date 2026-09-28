/**
 * Tarek Ghajary — Portfolio
 * Tabs + project filters
 */

(function () {
  'use strict';

  // ---------- Tabs ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(id) {
    tabBtns.forEach((btn) => {
      const active = btn.dataset.tab === id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === 'panel-' + id);
    });

    // Update URL hash without jump
    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });

  // Open tab from hash on load
  const hash = (location.hash || '#about').slice(1);
  const valid = Array.from(tabBtns).some((b) => b.dataset.tab === hash);
  activateTab(valid ? hash : 'about');

  // ---------- Project filters ----------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach((card) => {
        const category = card.dataset.category || '';
        const show = filter === 'all' || category.includes(filter);
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();
