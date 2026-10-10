/**
 * Project detail page — load README from GitHub API
 */
(function () {
  'use strict';

  const OWNER = 'CHESyrian';
  params = new URLSearchParams(location.search);
  const repo = (params.get('repo') || '').trim();

  const titleEl = document.getElementById('project-title');
  const metaEl = document.getElementById('project-meta');
  const statusEl = document.getElementById('readme-status');
  const readmeEl = document.getElementById('readme');
  const githubLink = document.getElementById('github-link');
  const eyebrowEl = document.getElementById('project-eyebrow');

  function setStatus(msg, isError) {
    statusEl.hidden = false;
    statusEl.textContent = msg;
    statusEl.classList.toggle('error', !!isError);
  }

  if (!repo || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    titleEl.textContent = 'Project not found';
    setStatus('Missing or invalid ?repo= parameter.', true);
    return;
  }

  document.title = repo + ' | Tarek Ghajary';
  titleEl.textContent = repo.replace(/_/g, ' ');
  githubLink.href = 'https://github.com/' + OWNER + '/' + repo;
  githubLink.textContent = 'View on GitHub';

  // Repo metadata
  fetch('https://api.github.com/repos/' + OWNER + '/' + repo)
    .then(function (r) {
      if (!r.ok) throw new Error('Repo not found');
      return r.json();
    })
    .then(function (data) {
      titleEl.textContent = data.name.replace(/_/g, ' ');
      const parts = [];
      if (data.language) parts.push(data.language);
      if (data.description) parts.push(data.description);
      metaEl.textContent = parts.join(' · ');
      if (data.description) eyebrowEl.textContent = 'Project';
    })
    .catch(function () {
      metaEl.textContent = 'Could not load repository details';
    });

  // README (API returns base64 content)
  fetch('https://api.github.com/repos/' + OWNER + '/' + repo + '/readme')
    .then(function (r) {
      if (!r.ok) throw new Error('No README');
      return r.json();
    })
    .then(function (data) {
      var md = '';
      try {
        md = decodeURIComponent(
          Array.prototype.map
            .call(atob(data.content.replace(/\s/g, '')), function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
      } catch (e) {
        md = atob(data.content.replace(/\s/g, ''));
      }

      if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        readmeEl.innerHTML = marked.parse(md);
      } else {
        readmeEl.innerHTML = '<pre>' + escapeHtml(md) + '</pre>';
      }

      // Fix relative image links to point at GitHub raw
      readmeEl.querySelectorAll('img').forEach(function (img) {
        var src = img.getAttribute('src') || '';
        if (src && !/^https?:\/\//i.test(src) && !src.startsWith('data:')) {
          img.src =
            'https://raw.githubusercontent.com/' +
            OWNER +
            '/' +
            repo +
            '/master/' +
            src.replace(/^\.\//, '');
        }
      });

      readmeEl.querySelectorAll('a').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (href && !/^https?:\/\//i.test(href) && !href.startsWith('#') && !href.startsWith('mailto:')) {
          a.href =
            'https://github.com/' +
            OWNER +
            '/' +
            repo +
            '/blob/master/' +
            href.replace(/^\.\//, '');
        }
        if (/^https?:\/\//i.test(a.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      });

      statusEl.hidden = true;
      readmeEl.hidden = false;
    })
    .catch(function () {
      setStatus(
        'No README found for this repository. You can still open it on GitHub.',
        true
      );
    });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>');
  }
})();
