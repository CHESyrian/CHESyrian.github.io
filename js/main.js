/**
 * Tarek Ghajary — Portfolio
 * Tabs + project accordion
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

    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });

  const hash = (location.hash || '#about').slice(1);
  const valid = Array.from(tabBtns).some((b) => b.dataset.tab === hash);
  activateTab(valid ? hash : 'about');

  // ---------- Accordion ----------
  document.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');
      // Optional: close others (single-open). Comment out to allow multi-open.
      // item.parentElement.querySelectorAll('.accordion-item.open').forEach((el) => {
      //   if (el !== item) el.classList.remove('open');
      // });

      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
})();
