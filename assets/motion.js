(function () {
  const STATE = {
    booted: false,
    reducedMotion: false,
  };

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_e) {
      return false;
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
  }

  function bootGsap() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {
      // ignore
    }

    window.addEventListener(
      'load',
      () => {
        try {
          ScrollTrigger.refresh();
        } catch (_e) {
          // ignore
        }
      },
      { once: true }
    );
  }

  function boot() {
    if (STATE.booted) return;
    STATE.booted = true;
    STATE.reducedMotion = prefersReducedMotion();

    bootAccordions();

    if (STATE.reducedMotion) return;
    bootGsap();
  }

  window.SyncNosMotion = Object.freeze({
    boot,
    prefersReducedMotion,
  });
})();
