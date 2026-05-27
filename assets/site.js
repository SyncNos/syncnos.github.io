(function () {
  const STORAGE_KEY = 'syncnos_landing_lang';

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {
      return false;
    }
  }

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

  function bootAccordions() {
    const root = document.querySelector('.h-accordions');
    if (!root) return;

    const panels = Array.from(root.querySelectorAll('.ha-panel'));
    if (panels.length === 0) return;

    function setActiveIndex(index) {
      const safeIndex = Math.max(0, Math.min(panels.length - 1, index));
      root.dataset.activeIndex = String(safeIndex);
      panels.forEach((panel, i) => {
        const trigger = panel.querySelector('.ha-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', i === safeIndex ? 'true' : 'false');
      });
    }

    const initial = Number.parseInt(String(root.dataset.activeIndex || '0'), 10);
    setActiveIndex(Number.isFinite(initial) ? initial : 0);

    panels.forEach((panel, index) => {
      const trigger = panel.querySelector('.ha-trigger');

      panel.addEventListener('pointerenter', () => setActiveIndex(index));

      if (trigger) {
        trigger.addEventListener('focus', () => setActiveIndex(index));
        trigger.addEventListener('click', () => setActiveIndex(index));
      }
    });

    if (prefersReducedMotion()) {
      setActiveIndex(Number.parseInt(String(root.dataset.activeIndex || '0'), 10) || 0);
    }
  }

  function boot() {
    setLang(getLang());
    for (const el of document.querySelectorAll('[data-set-lang]')) {
      el.addEventListener('click', () => setLang(el.getAttribute('data-set-lang') || 'en'));
    }
    bootAccordions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
