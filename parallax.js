document.addEventListener('DOMContentLoaded', function () {
  const EXCLUDE_SELECTORS = [
    '.logo-clean',
    '.footer-socials img',
    '.navicon',
    '.logo',
    '.donut',
    '#menumade',
    '.delivery-btn img'
  ];

  const CANDIDATE_SELECTORS = [
    '.hero-img',
    '.gallery-hero-image',
    '.menu-hero-image',
    '#intro img',
    '.gallery-card img',
    '.menu-panel img',
    '.gallery img',
    '.menu img'
  ];

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const maxShift = isMobile ? 24 : 56;
  const bleed = isMobile ? 24 : 40;

  function shouldExclude(el) {
    return EXCLUDE_SELECTORS.some(selector => el.matches(selector));
  }

  function collectTargets() {
    const found = new Set();

    CANDIDATE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!shouldExclude(el)) found.add(el);
      });
    });

    return Array.from(found);
  }

  function wrapImage(el) {
    if (!el || el.dataset.parallaxProcessed === '1') return null;

    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);

    const wrapper = document.createElement('div');
    wrapper.className = 'parallax-auto-wrap';

    wrapper.style.width = rect.width ? rect.width + 'px' : '100%';
    wrapper.style.height = rect.height ? rect.height + 'px' : (el.offsetHeight || 300) + 'px';
    wrapper.style.maxWidth = computed.maxWidth !== 'none' ? computed.maxWidth : '100%';
    wrapper.style.marginTop = computed.marginTop;
    wrapper.style.marginRight = computed.marginRight;
    wrapper.style.marginBottom = computed.marginBottom;
    wrapper.style.marginLeft = computed.marginLeft;
    wrapper.style.borderRadius = computed.borderRadius;
    wrapper.style.display = computed.display === 'inline' ? 'block' : computed.display;
    wrapper.style.verticalAlign = computed.verticalAlign;

    el.style.margin = '0';
    el.style.width = '100%';
    el.style.maxWidth = 'none';
    el.style.display = 'block';

    const parent = el.parentNode;
    parent.insertBefore(wrapper, el);
    wrapper.appendChild(el);

    el.classList.add('parallax-auto');
    el.dataset.parallaxProcessed = '1';
    wrapper.dataset.parallaxBleed = String(bleed);

    return { image: el, wrapper };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const targets = collectTargets()
    .map(wrapImage)
    .filter(Boolean);

  if (!targets.length) return;

  function refreshWrapperHeights() {
    targets.forEach(({ image, wrapper }) => {
      const currentTransform = image.style.transform;
      image.style.transform = 'translate3d(0,0,0)';

      const imgRect = image.getBoundingClientRect();
      if (imgRect.width > 0) {
        wrapper.style.height = (imgRect.height - (bleed * 2)) + 'px';
      }

      image.style.transform = currentTransform;
    });
  }

  function updateParallax() {
    const viewportH = window.innerHeight;

    targets.forEach(({ image, wrapper }) => {
      const rect = wrapper.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportH) return;

      const progress = clamp((viewportH - rect.top) / (viewportH + rect.height), 0, 1);
      const translateY = -maxShift + (progress * maxShift * 2);

      image.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
  }

  let ticking = false;

  function requestUpdate() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  function onResize() {
    refreshWrapperHeights();
    requestUpdate();
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', function () {
    refreshWrapperHeights();
    requestUpdate();
  });

  refreshWrapperHeights();
  requestUpdate();
});