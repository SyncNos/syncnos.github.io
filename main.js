// SyncNos landing — zero-dependency theme toggle, i18n, and scroll reveal.
// ponytail: no framework, no deps; Chinese is the DOM default, English lives in data-en.
(function () {
  var root = document.documentElement;

  // ---- Theme (system default, manual override persisted) ----
  function setTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('theme', t); } catch (e) {} }
  var themeBtn = document.getElementById('theme');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  // follow system changes only when the user hasn't chosen explicitly
  try {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  } catch (e) {}

  // ---- Install: point the primary CTAs at the visitor's own browser store ----
  var STORES = {
    chrome: 'https://chromewebstore.google.com/detail/syncnos-webclipper/hmgjflllphdffeocddjjcfllifhejpok',
    edge: 'https://microsoftedge.microsoft.com/addons/detail/syncnosaiweb-clipper/ijkpghlfmkbjcgafapjcjahaikmnjncl',
    firefox: 'https://addons.mozilla.org/firefox/addon/syncnos-webclipper/'
  };
  var ua = navigator.userAgent || '';
  var bkey = /Firefox\//.test(ua) ? 'firefox' : (/Edg\//.test(ua) ? 'edge' : 'chrome');
  var bname = { chrome: 'Chrome', edge: 'Edge', firefox: 'Firefox' }[bkey];
  var installs = document.querySelectorAll('[data-install]');
  for (var n = 0; n < installs.length; n++) {
    installs[n].setAttribute('href', STORES[bkey]);
    if (installs[n].getAttribute('data-install') === 'hero') {
      installs[n].innerHTML = '安装到 ' + bname;
      installs[n].setAttribute('data-en', 'Add to ' + bname);
    }
  }
  // matching store solid in the footer; the other two stay one tap away
  var storeLinks = document.querySelectorAll('[data-store]');
  for (var p = 0; p < storeLinks.length; p++) {
    storeLinks[p].className = (storeLinks[p].getAttribute('data-store') === bkey) ? 'btn' : 'btn btn-ghost';
  }

  // ---- Language (zh default in DOM, en in data-en) ----
  function setLang(l) {
    root.setAttribute('lang', l);
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute('data-zh') === null) el.setAttribute('data-zh', el.innerHTML);
      el.innerHTML = (l === 'en') ? el.getAttribute('data-en') : el.getAttribute('data-zh');
    }
    var lb = document.getElementById('lang');
    if (lb) lb.textContent = (l === 'en') ? '\u4e2d' : 'EN';
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function () {
    setLang(root.getAttribute('lang') === 'en' ? 'zh' : 'en');
  });
  var saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
  var initLang = saved || (((navigator.language || '').toLowerCase().indexOf('zh') === 0) ? 'zh' : 'en');
  if (initLang === 'en') setLang('en');

  // ---- Scroll reveal (native IntersectionObserver, graceful fallback) ----
  var targets = document.querySelectorAll('.reveal, .gather');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  } else {
    for (var k = 0; k < targets.length; k++) targets[k].classList.add('in');
  }
})();
