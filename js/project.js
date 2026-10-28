/**
 * Project detail page — fetch README and render as HTML
 * Optimized for restricted networks (e.g. Syria): short timeouts,
 * jsDelivr first, parallel attempts, never stuck on "Loading…".
 */
(function () {
  'use strict';

  var OWNER = 'CHESyrian';
  var TIMEOUT_MS = 5000;
  var params = new URLSearchParams(location.search);
  var repo = (params.get('repo') || '').trim();
  var readmeBranch = 'master';

  var titleEl = document.getElementById('project-title');
  var metaEl = document.getElementById('project-meta');
  var statusEl = document.getElementById('readme-status');
  var readmeEl = document.getElementById('readme');
  var githubLink = document.getElementById('github-link');

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.classList.toggle('error', !!isError);
    statusEl.innerHTML = msg;
  }

  function showReadmeHtml(html) {
    readmeEl.innerHTML = html;
    fixMediaAndLinks();
    statusEl.hidden = true;
    readmeEl.hidden = false;
  }

  function fetchWithTimeout(url) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    var opts = {};
    if (controller) {
      opts.signal = controller.signal;
      timer = setTimeout(function () {
        try { controller.abort(); } catch (e) {}
      }, TIMEOUT_MS);
    }
    return fetch(url, opts)
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r;
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  function resolveRepoUrl(path, forImage) {
    if (!path) return path;
    path = String(path).trim();
    if (path.indexOf('data:') === 0 || path.charAt(0) === '#') return path;
    if (/^https?:\/\//i.test(path)) {
      if (forImage) {
        var blob = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i.exec(path);
        if (blob) {
          return 'https://cdn.jsdelivr.net/gh/' + blob[1] + '/' + blob[2] + '@' + blob[3] + '/' + blob[4];
        }
      }
      return path;
    }
    if (path.indexOf('//') === 0) return 'https:' + path;
    var rel = path.replace(/^\.\//, '').replace(/^\//, '');
    if (forImage) {
      return 'https://cdn.jsdelivr.net/gh/' + OWNER + '/' + repo + '@' + readmeBranch + '/' + rel;
    }
    return 'https://github.com/' + OWNER + '/' + repo + '/blob/' + readmeBranch + '/' + rel;
  }

  function fixMediaAndLinks() {
    readmeEl.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      var resolved = resolveRepoUrl(src, true);
      if (resolved && resolved !== src) img.setAttribute('src', resolved);
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      if (!img.getAttribute('alt')) img.setAttribute('alt', 'README image');
      img.addEventListener('error', function onErr() {
        img.removeEventListener('error', onErr);
        var s = img.getAttribute('src') || '';
        if (s.indexOf('cdn.jsdelivr.net/gh/') !== -1) {
          var m = /cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\/(.+)$/.exec(s);
          if (m) {
            img.src = 'https://raw.githubusercontent.com/' + m[1] + '/' + m[2] + '/' + m[3] + '/' + m[4];
            return;
          }
        }
        if (s.indexOf('/master/') !== -1 || s.indexOf('@master/') !== -1) {
          img.src = s.replace('/master/', '/main/').replace('@master/', '@main/');
        } else if (s.indexOf('/main/') !== -1 || s.indexOf('@main/') !== -1) {
          img.src = s.replace('/main/', '/master/').replace('@main/', '@master/');
        }
      }, { once: true });
    });

    readmeEl.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) return;
      if (!/^https?:\/\//i.test(href) && href.indexOf('//') !== 0) {
        a.setAttribute('href', resolveRepoUrl(href, false));
      }
      if (/^https?:\/\//i.test(a.getAttribute('href') || '')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }

  function mdToHtml(md) {
    if (typeof marked === 'undefined') {
      return '<pre style="white-space:pre-wrap;word-break:break-word">' +
        String(md).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>') +
        '</pre>';
    }
    if (typeof marked.parse === 'function') {
      if (typeof marked.setOptions === 'function') {
        marked.setOptions({ breaks: true, gfm: true });
      }
      return marked.parse(md);
    }
    if (typeof marked === 'function') {
      return marked(md, { breaks: true, gfm: true });
    }
    return '<pre style="white-space:pre-wrap">' + String(md).replace(/</g, '<') + '</pre>';
  }

  function decodeBase64Utf8(b64) {
    var binary = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(bytes);
    try {
      return decodeURIComponent(
        Array.prototype.map.call(binary, function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
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

  var ghUrl = 'https://github.com/' + OWNER + '/' + repo;
  document.title = repo.replace(/_/g, ' ') + ' | Tarek Ghajary';
  titleEl.textContent = repo.replace(/_/g, ' ');
  githubLink.href = ghUrl;
  githubLink.textContent = 'View on GitHub';

  // Show helpful status + GitHub link immediately (never leave user waiting with nothing)
  setStatus(
    'Loading README… <span style="opacity:.7">If this takes too long, open the project on GitHub:</span> ' +
    '<a href="' + ghUrl + '" target="_blank" rel="noopener">github.com/' + OWNER + '/' + repo + '</a>'
  );

  // Repo metadata (non-blocking, short timeout)
  fetchWithTimeout('https://api.github.com/repos/' + OWNER + '/' + repo)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      titleEl.textContent = (data.name || repo).replace(/_/g, ' ');
      var parts = [];
      if (data.language) parts.push(data.language);
      if (data.description) parts.push(data.description);
      metaEl.textContent = parts.join(' · ');
      if (data.default_branch) readmeBranch = data.default_branch;
    })
    .catch(function () {});

  function loadJsDelivr(branch) {
    return fetchWithTimeout(
      'https://cdn.jsdelivr.net/gh/' + OWNER + '/' + repo + '@' + branch + '/README.md'
    ).then(function (r) {
      readmeBranch = branch;
      return r.text();
    });
  }

  function loadRaw(branch) {
    return fetchWithTimeout(
      'https://raw.githubusercontent.com/' + OWNER + '/' + repo + '/' + branch + '/README.md'
    ).then(function (r) {
      readmeBranch = branch;
      return r.text();
    });
  }

  function loadApi() {
    return fetchWithTimeout('https://api.github.com/repos/' + OWNER + '/' + repo + '/readme')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.download_url) {
          var m = /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\//.exec(data.download_url);
          if (m) readmeBranch = m[1];
        }
        return decodeBase64Utf8(data.content);
      });
  }

  // Race: try jsDelivr first (often works when GitHub is blocked), then raw, then API
  // Short 5s timeout each so total wait is bounded
  loadJsDelivr('master')
    .catch(function () { return loadJsDelivr('main'); })
    .catch(function () { return loadRaw('master'); })
    .catch(function () { return loadRaw('main'); })
    .catch(function () { return loadApi(); })
    .then(function (md) {
      if (!md || !String(md).trim()) throw new Error('empty');
      showReadmeHtml(mdToHtml(String(md)));
    })
    .catch(function (err) {
      console.error('README load failed', err);
      setStatus(
        'Could not load the README (network blocked or timeout from this region). ' +
        'Open the full project on GitHub instead: ' +
        '<a href="' + ghUrl + '" target="_blank" rel="noopener">' + ghUrl + '</a>',
        true
      );
    });
})();
