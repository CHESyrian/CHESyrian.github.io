/**
 * Project detail page — fetch README and render as HTML
 * Images: relative paths, repo-root paths, and GitHub blob URLs → raw.githubusercontent.com
 */
(function () {
  'use strict';

  var OWNER = 'CHESyrian';
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
   * Turn any README image/link path into a URL that works on this static site.
   * - https://… → keep (but blob → raw for images)
   * - ./file.png, docs/a.png → raw.githubusercontent.com/owner/repo/branch/…
   * - /docs/a.png (repo-root style) → same
   */
  function resolveRepoUrl(path, forImage) {
    if (!path) return path;
    path = String(path).trim();

    // data: and anchors
    if (path.indexOf('data:') === 0 || path.charAt(0) === '#') return path;

    // Absolute http(s)
    if (/^https?:\/\//i.test(path)) {
      if (forImage) {
        // github.com/owner/repo/blob/branch/path → raw
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
        // already raw or other CDN — keep
      }
      return path;
    }

    // Protocol-relative
    if (path.indexOf('//') === 0) {
      return 'https:' + path;
    }

    // Strip leading ./ and /
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
      return base + rel;
    }
    // Non-image links open on GitHub
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
      // If master 404s, retry main once
      img.addEventListener(
        'error',
        function onErr() {
          img.removeEventListener('error', onErr);
          var s = img.getAttribute('src') || '';
          if (s.indexOf('/master/') !== -1) {
            img.src = s.replace('/master/', '/main/');
          } else if (s.indexOf('/main/') !== -1) {
            img.src = s.replace('/main/', '/master/');
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
      // If the link wraps only an image, still resolve relative targets
      if (!/^https?:\/\//i.test(href) && href.indexOf('//') !== 0) {
        a.setAttribute('href', resolveRepoUrl(href, false));
      } else if (/github\.com\/[^/]+\/[^/]+\/blob\//i.test(href)) {
        // keep blob links as-is for navigation
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
      if (data.default_branch) {
        readmeBranch = data.default_branch;
      }
    })
    .catch(function () {
      metaEl.textContent = '';
    });

  function loadFromRaw(branch) {
    return fetch(
      'https://raw.githubusercontent.com/' + OWNER + '/' + repo + '/' + branch + '/README.md'
    ).then(function (r) {
      if (!r.ok) throw new Error('raw ' + branch);
      readmeBranch = branch;
      return r.text();
    });
  }

  function loadFromApi() {
    return fetch('https://api.github.com/repos/' + OWNER + '/' + repo + '/readme')
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

  loadFromRaw('master')
    .catch(function () {
      return loadFromRaw('main');
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
      setStatus(
        'Could not load or render the README. Open the project on GitHub instead.',
        true
      );
    });
})();
