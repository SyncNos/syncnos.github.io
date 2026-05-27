(function () {
  const STORAGE_KEY = 'syncnos_landing_lang';

  function inferLang() {
    const nav = String(navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    return 'en';
  }

  function getLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'en' || v === 'zh') return v;
    } catch (_e) {
      // ignore
    }
    return inferLang();
  }

  function setLang(lang) {
    const value = lang === 'zh' ? 'zh' : 'en';
    document.documentElement.setAttribute('data-lang', value);
    document.documentElement.setAttribute('lang', value === 'zh' ? 'zh-CN' : 'en');
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_e) {
      // ignore
    }
    for (const el of document.querySelectorAll('[data-set-lang]')) {
      const elLang = el.getAttribute('data-set-lang');
      el.setAttribute('aria-pressed', elLang === value ? 'true' : 'false');
    }
  }

  function boot() {
    setLang(getLang());
    for (const el of document.querySelectorAll('[data-set-lang]')) {
      el.addEventListener('click', () => setLang(el.getAttribute('data-set-lang') || 'en'));
    }
    if (window.SyncNosMotion && typeof window.SyncNosMotion.boot === 'function') {
      window.SyncNosMotion.boot();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
