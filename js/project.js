/**
 * Project detail page — fetch README and render as HTML
 * Sources (in order): raw.githubusercontent.com → jsDelivr → GitHub API
 * Each request times out so the UI never stays on "Loading README…" forever.
 */
(function () {
  'use strict';

  var OWNER = 'CHESyrian';
  var FETCH_TIMEOUT_MS = 12000;
  var params = new URLSearchParams(location.search);
  var repo = (params.get('repo') || '').trim();
  /** Branch used to load README — also used for image/link resolution */
  var readmeBranch = 'master';

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
    fixMediaAndLinks();
    statusEl.hidden = true;
    readmeEl.hidden = false;
  }

  /**
   * fetch with AbortController timeout
   */
  function fetchWithTimeout(url, options) {
    options = options || {};
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    if (controller) {
      options.signal = controller.signal;
      timer = setTimeout(function () {
        try {
          controller.abort();
        } catch (e) {}
      }, FETCH_TIMEOUT_MS);
    }
    return fetch(url, options)
      .then(function (r) {
        if (timer) clearTimeout(timer);
        return r;
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  /**
   * Turn any README image/link path into a URL that works on this static site.
   */
  function resolveRepoUrl(path, forImage) {
    if (!path) return path;
    path = String(path).trim();

    if (path.indexOf('data:') === 0 || path.charAt(0) === '#') return path;

    if (/^https?:\/\//i.test(path)) {
      if (forImage) {
        var blob =
          /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i.exec(
            path
          );
        if (blob) {
          return (
            'https://raw.githubusercontent.com/' +
            blob[1] +
            '/' +
            blob[2] +
            '/' +
            blob[3] +
            '/' +
            blob[4]
          );
        }
      }
      return path;
    }

    if (path.indexOf('//') === 0) {
      return 'https:' + path;
    }

    var rel = path.replace(/^\.\//, '').replace(/^\//, '');

    var base =
      'https://raw.githubusercontent.com/' +
      OWNER +
      '/' +
      repo +
      '/' +
      readmeBranch +
      '/';

    if (forImage) {
      // Prefer jsDelivr for images (often works when raw.githubusercontent is blocked)
      return (
        'https://cdn.jsdelivr.net/gh/' +
        OWNER +
        '/' +
        repo +
        '@' +
        readmeBranch +
        '/' +
        rel
      );
    }
    return (
      'https://github.com/' +
      OWNER +
      '/' +
      repo +
      '/blob/' +
      readmeBranch +
      '/' +
      rel
    );
  }

  function fixMediaAndLinks() {
    readmeEl.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      var resolved = resolveRepoUrl(src, true);
      if (resolved && resolved !== src) {
        img.setAttribute('src', resolved);
      }
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', 'README image');
      }
      img.addEventListener(
        'error',
        function onErr() {
          img.removeEventListener('error', onErr);
          var s = img.getAttribute('src') || '';
          // Fallbacks: jsdelivr ↔ raw, master ↔ main
          if (s.indexOf('cdn.jsdelivr.net/gh/') !== -1) {
            var m = /cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^@]+)@([^/]+)\/(.+)$/.exec(s);
            if (m) {
              img.src =
                'https://raw.githubusercontent.com/' +
                m[1] +
                '/' +
                m[2] +
                '/' +
                m[3] +
                '/' +
                m[4];
              return;
            }
          }
          if (s.indexOf('/master/') !== -1) {
            img.src = s.replace('/master/', '/main/').replace('@master/', '@main/');
          } else if (s.indexOf('/main/') !== -1) {
            img.src = s.replace('/main/', '/master/').replace('@main/', '@master/');
          }
        },
        { once: true }
      );
    });

    readmeEl.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) {
        return;
      }
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
      throw new Error('Markdown renderer not loaded');
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
    throw new Error('Unsupported marked API');
  }

  function decodeBase64Utf8(b64) {
    var binary = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
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

  // Repo metadata (non-blocking)
  fetchWithTimeout('https://api.github.com/repos/' + OWNER + '/' + repo)
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
      if (data.default_branch) {
        readmeBranch = data.default_branch;
      }
    })
    .catch(function () {
      /* ignore — README load is independent */
    });

  function loadFromRaw(branch) {
    return fetchWithTimeout(
      'https://raw.githubusercontent.com/' +
        OWNER +
        '/' +
        repo +
        '/' +
        branch +
        '/README.md'
    ).then(function (r) {
      if (!r.ok) throw new Error('raw ' + branch);
      readmeBranch = branch;
      return r.text();
    });
  }

  function loadFromJsDelivr(branch) {
    return fetchWithTimeout(
      'https://cdn.jsdelivr.net/gh/' +
        OWNER +
        '/' +
        repo +
        '@' +
        branch +
        '/README.md'
    ).then(function (r) {
      if (!r.ok) throw new Error('jsdelivr ' + branch);
      readmeBranch = branch;
      return r.text();
    });
  }

  function loadFromApi() {
    return fetchWithTimeout(
      'https://api.github.com/repos/' + OWNER + '/' + repo + '/readme'
    )
      .then(function (r) {
        if (!r.ok) throw new Error('api');
        return r.json();
      })
      .then(function (data) {
        if (data.download_url) {
          var m = /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\//.exec(
            data.download_url
          );
          if (m) readmeBranch = m[1];
        }
        return decodeBase64Utf8(data.content);
      });
  }

  setStatus('Loading README…');

  // Try multiple sources so blocked networks still work when possible
  loadFromRaw('master')
    .catch(function () {
      return loadFromRaw('main');
    })
    .catch(function () {
      return loadFromJsDelivr('master');
    })
    .catch(function () {
      return loadFromJsDelivr('main');
    })
    .catch(function () {
      return loadFromApi();
    })
    .then(function (md) {
      if (!md || !String(md).trim()) throw new Error('empty');
      showReadmeHtml(mdToHtml(String(md)));
    })
    .catch(function (err) {
      console.error(err);
      var ghUrl = 'https://github.com/' + OWNER + '/' + repo;
      statusEl.hidden = false;
      statusEl.classList.add('error');
      statusEl.innerHTML =
        'Could not load the README (network timeout, blocked CDN, or no README in this repo). ' +
        '<a href="' +
        ghUrl +
        '" target="_blank" rel="noopener">Open on GitHub</a> instead.';
    });
})();
