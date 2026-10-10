/**
 * Project detail page — fetch README and render as HTML (not raw markdown)
 */
(function () {
  'use strict';

  var OWNER = 'CHESyrian';
  var params = new URLSearchParams(location.search);
  var repo = (params.get('repo') || '').trim();

  var titleEl = document.getElementById('project-title');
  var metaEl = document.getElementById('project-meta');
  var statusEl = document.getElementById('readme-status');
  var readmeEl = document.getElementById('readme');
  var githubLink = document.getElementById('github-link');

  function setStatus(msg, isError) {
    statusEl.hidden = false;
    statusEl.textContent = msg;
    statusEl.classList.toggle('error', !!isError);
  }

  function showReadmeHtml(html) {
    readmeEl.innerHTML = html;
    fixRelativeLinks();
    statusEl.hidden = true;
    readmeEl.hidden = false;
  }

  function fixRelativeLinks() {
    readmeEl.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (src && !/^https?:\/\//i.test(src) && src.indexOf('data:') !== 0) {
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
      if (
        href &&
        !/^https?:\/\//i.test(href) &&
        href.charAt(0) !== '#' &&
        href.indexOf('mailto:') !== 0
      ) {
        a.href =
          'https://github.com/' +
          OWNER +
          '/' +
          repo +
          '/blob/master/' +
          href.replace(/^\.\//, '');
      }
      if (/^https?:\/\//i.test(a.getAttribute('href') || '')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }

  /** Convert markdown string → HTML using marked (UMD global) */
  function mdToHtml(md) {
    if (typeof marked === 'undefined') {
      throw new Error('Markdown renderer not loaded');
    }
    // marked v9+ : marked.parse ; older: marked()
    if (typeof marked.parse === 'function') {
      if (typeof marked.setOptions === 'function') {
        marked.setOptions({ breaks: true, gfm: true });
      }
      return marked.parse(md);
    }
    if (typeof marked === 'function') {
      return marked(md, { breaks: true, gfm: true });
    }
    throw new Error('Unsupported marked API');
  }

  /** Decode GitHub API base64 README content to UTF-8 text */
  function decodeBase64Utf8(b64) {
    var binary = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
    // Fallback
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(binary, function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch (e) {
      return binary;
    }
  }

  if (!repo || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    titleEl.textContent = 'Project not found';
    setStatus('Missing or invalid ?repo= parameter.', true);
    return;
  }

  document.title = repo.replace(/_/g, ' ') + ' | Tarek Ghajary';
  titleEl.textContent = repo.replace(/_/g, ' ');
  githubLink.href = 'https://github.com/' + OWNER + '/' + repo;
  githubLink.textContent = 'View on GitHub';

  // Repo meta
  fetch('https://api.github.com/repos/' + OWNER + '/' + repo)
    .then(function (r) {
      if (!r.ok) throw new Error('not found');
      return r.json();
    })
    .then(function (data) {
      titleEl.textContent = (data.name || repo).replace(/_/g, ' ');
      var parts = [];
      if (data.language) parts.push(data.language);
      if (data.description) parts.push(data.description);
      metaEl.textContent = parts.join(' · ');
    })
    .catch(function () {
      metaEl.textContent = '';
    });

  // Prefer raw text (simple, CORS-friendly), then API fallback
  function loadFromRaw(branch) {
    return fetch(
      'https://raw.githubusercontent.com/' + OWNER + '/' + repo + '/' + branch + '/README.md'
    ).then(function (r) {
      if (!r.ok) throw new Error('raw ' + branch);
      return r.text();
    });
  }

  function loadFromApi() {
    return fetch('https://api.github.com/repos/' + OWNER + '/' + repo + '/readme').then(
      function (r) {
        if (!r.ok) throw new Error('api');
        return r.json();
      }
    ).then(function (data) {
      return decodeBase64Utf8(data.content);
    });
  }

  loadFromRaw('master')
    .catch(function () {
      return loadFromRaw('main');
    })
    .catch(function () {
      return loadFromApi();
    })
    .then(function (md) {
      if (!md || !String(md).trim()) {
        throw new Error('empty');
      }
      var html = mdToHtml(String(md));
      showReadmeHtml(html);
    })
    .catch(function (err) {
      console.error(err);
      setStatus(
        'Could not load or render the README. Open the project on GitHub instead.',
        true
      );
    });
})();
