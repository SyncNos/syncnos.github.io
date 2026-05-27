(function () {
  const STATE = {
    booted: false,
    reducedMotion: false,
  };

  let overflowWarned = false;

  function warnIfHorizontalOverflow() {
    if (overflowWarned) return;
    try {
      const doc = document.documentElement;
      if (doc && doc.scrollWidth > window.innerWidth + 1) {
        overflowWarned = true;
        console.warn('[SyncNos] Horizontal overflow detected', {
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
        });
      }
    } catch (_e) {
      // ignore
    }
  }

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

    function getNavOffset() {
      const el = document.querySelector('.sn-nav-inner');
      if (!el) return 96;
      const rect = el.getBoundingClientRect();
      return Math.round(rect.height + 28);
    }

    function bootPinSplit() {
      const container = document.querySelector('[data-motion="pin-split"]');
      if (!container) return;

      const left = container.querySelector('.pin-left');
      const right = container.querySelector('.pin-right');
      if (!left || !right) return;

      ScrollTrigger.matchMedia({
        '(min-width: 980px)': () => {
          const trigger = ScrollTrigger.create({
            trigger: container,
            start: () => `top top+=${getNavOffset()}`,
            end: () => {
              const delta = Math.max(0, right.scrollHeight - left.offsetHeight);
              return `+=${delta}`;
            },
            pin: left,
            pinSpacing: true,
            invalidateOnRefresh: true,
          });

          return () => {
            try {
              trigger.kill();
            } catch (_e) {
              // ignore
            }
          };
        },
      });
    }

    function bootGalleryScaleFade() {
      const items = Array.from(document.querySelectorAll('.pin-gallery .gallery-item'));
      if (items.length === 0) return;

      ScrollTrigger.matchMedia({
        '(min-width: 980px)': () => {
          const timelines = [];

          items.forEach((item) => {
            const img = item.querySelector('.gallery-img');
            const media = item.querySelector('.gallery-media');
            if (!img || !media) return;

            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                end: 'bottom 15%',
                scrub: true,
              },
            });

            tl.fromTo(img, { scale: 0.8, opacity: 0.2 }, { scale: 1, opacity: 1, duration: 0.5 }, 0);
            tl.to(img, { opacity: 0.2, duration: 0.5 }, 0.5);

            tl.fromTo(media, { '--gallery-dim': 0.35 }, { '--gallery-dim': 0.08, duration: 0.5 }, 0);
            tl.to(media, { '--gallery-dim': 0.35, duration: 0.5 }, 0.5);

            timelines.push(tl);
          });

          return () => {
            timelines.forEach((tl) => {
              try {
                tl.kill();
              } catch (_e) {
                // ignore
              }
            });
          };
        },
      });
    }

    bootPinSplit();
    bootGalleryScaleFade();

    window.addEventListener(
      'load',
      () => {
        try {
          ScrollTrigger.refresh();
          warnIfHorizontalOverflow();
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

    window.addEventListener('resize', () => requestAnimationFrame(warnIfHorizontalOverflow), { passive: true });
    window.addEventListener('load', warnIfHorizontalOverflow, { once: true });
  }

  window.SyncNosMotion = Object.freeze({
    boot,
    prefersReducedMotion,
  });
})();
