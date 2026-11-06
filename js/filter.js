// Tag filter: builds a row of every tag used by the projects on the page.
// Clicking tags shows only projects that have at least one of the selected tags.
// The selection is kept in the address (?tags=Photography,Web) so filtered views can be shared.
(function () {
  const bar = document.querySelector('.filters');
  if (!bar) return;

  const projects = Array.from(document.querySelectorAll('main .project'));
  const tagsOf = new Map(projects.map((p) => [p, Array.from(p.querySelectorAll('.tag')).map((t) => t.textContent.trim())]));

  // all tags, most used first, then alphabetical
  const counts = new Map();
  tagsOf.forEach((tags) => tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  const allTags = Array.from(counts.keys()).sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));

  const selected = new Set();
  const list = bar.querySelector('.filter-list');
  const status = bar.querySelector('.filter-status');
  const toggleBtn = bar.querySelector('.filter-toggle');
  const countEl = bar.querySelector('.filter-count');

  function button(label, tag) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter';
    b.textContent = label;
    if (tag) b.dataset.tag = tag;
    list.appendChild(b);
    return b;
  }
  const allButton = button('All');
  allTags.forEach((t) => button(t, t));

  function render() {
    let shown = 0;
    projects.forEach((p) => {
      const match = selected.size === 0 || tagsOf.get(p).some((t) => selected.has(t));
      p.hidden = !match;
      if (match) shown++;
    });
    list.querySelectorAll('.filter').forEach((b) => {
      const on = b === allButton ? selected.size === 0 : selected.has(b.dataset.tag);
      b.setAttribute('aria-pressed', on);
    });
    // highlight matching tags inside each project
    document.querySelectorAll('main .project .tag').forEach((t) => t.classList.toggle('is-match', selected.has(t.textContent.trim())));
    status.textContent = selected.size ? `${shown} of ${projects.length} projects` : `${projects.length} projects`;
    if (countEl) countEl.textContent = selected.size || '';
    if (toggleBtn) toggleBtn.setAttribute('aria-label', selected.size ? `Filter, ${selected.size} selected` : 'Filter');

    const url = new URL(location.href);
    if (selected.size) url.searchParams.set('tags', Array.from(selected).join(','));
    else url.searchParams.delete('tags');
    history.replaceState(null, '', url);
  }

  function toggle(tag) {
    if (selected.has(tag)) selected.delete(tag);
    else selected.add(tag);
    render();
  }

  list.addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (!b) return;
    if (b === allButton) { selected.clear(); render(); }
    else toggle(b.dataset.tag);
  });

  // phones: the tag list folds away behind the Filter button
  function setOpen(open) {
    bar.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', open);
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const open = toggleBtn.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open) list.querySelector('.filter')?.focus();
    });
    bar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bar.classList.contains('is-open')) { setOpen(false); toggleBtn.focus(); }
    });
  }

  // tags inside projects work as filter shortcuts too
  document.querySelectorAll('main .project .tag').forEach((t) => {
    t.setAttribute('role', 'button');
    t.tabIndex = 0;
    t.title = `Show only ${t.textContent.trim()}`;
    const go = () => {
      toggle(t.textContent.trim());
      bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    t.addEventListener('click', go);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  // restore from the address
  const fromUrl = new URLSearchParams(location.search).get('tags');
  if (fromUrl) fromUrl.split(',').forEach((t) => counts.has(t) && selected.add(t));
  render();
})();

// pinned bar: thin line, one-row fit, and the MH logo that travels into the bar
(function () {
  const bar = document.querySelector('.filters');
  if (!bar || getComputedStyle(bar).position !== 'sticky') return;
  const sentinel = document.createElement('div');
  bar.before(sentinel);
  const slot = bar.querySelector('.bar-slot');
  const logo = document.querySelector('.site-header .logo');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const toggle = bar.querySelector('.filter-toggle');
  const desktop = window.matchMedia('(min-width: 769px)');
  let baseMargin = null;
  let looseHeight = 0; // the bar's height just before it pins

  // pinned on a desktop where the tags would wrap: fold them behind the Filter button.
  // The bar gets shorter, so its bottom margin grows by the same amount and nothing below moves.
  function fitPinned() {
    const stuck = bar.classList.contains('is-stuck');
    bar.classList.remove('is-compact');
    bar.style.marginBottom = '';
    if (!stuck || !desktop.matches) {
      looseHeight = bar.offsetHeight;
      bar.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
      return;
    }
    const tags = bar.querySelectorAll('.filter');
    const wraps = tags.length && tags[tags.length - 1].offsetTop > tags[0].offsetTop;
    if (!wraps) return;
    if (baseMargin === null) baseMargin = parseFloat(getComputedStyle(bar).marginBottom);
    const full = looseHeight || bar.offsetHeight;
    bar.classList.add('is-compact');
    bar.style.marginBottom = `${baseMargin + full - bar.offsetHeight}px`;
  }

  new IntersectionObserver(([e]) => {
    const stuck = !e.isIntersecting && e.boundingClientRect.top < 0;
    bar.classList.toggle('is-stuck', stuck);
    fitPinned();
  }).observe(sentinel);
  window.addEventListener('resize', () => {
    baseMargin = null;
    if (bar.classList.contains('is-stuck')) {
      bar.classList.remove('is-stuck', 'is-compact'); bar.style.marginBottom = '';
      looseHeight = bar.offsetHeight;
      bar.classList.add('is-stuck');
    }
    fitPinned();
  });

  if (!slot || !logo) return;

  // The travelling MH is a fixed-position copy of the logo, so the page scrolling can never
  // drag it out of place; its position depends only on how far you have scrolled (k).
  // Before it moves, the real logo shows; once it lands, the bar's own MH (which scrolls in
  // step with the bar) takes over.
  const flyer = logo.cloneNode(true);
  flyer.classList.add('logo-flyer');
  flyer.setAttribute('aria-hidden', 'true');
  flyer.setAttribute('tabindex', '-1');
  flyer.removeAttribute('href');
  document.body.appendChild(flyer);

  // the bar's tallest unpinned height over the whole glide (the arriving MH can push a tag
  // onto another row); reserving it keeps the page height constant while scrolling
  function reserveHeight() {
    const stuck = bar.classList.contains('is-stuck');
    const compact = bar.classList.contains('is-compact');
    const mb = bar.style.marginBottom, k = bar.style.getPropertyValue('--k');
    bar.classList.remove('is-stuck', 'is-compact');
    bar.style.marginBottom = '';
    bar.style.removeProperty('--loose-h');
    bar.style.setProperty('--k', 0);
    const h0 = bar.offsetHeight;
    bar.style.setProperty('--k', 1);
    const h1 = bar.offsetHeight;
    bar.style.setProperty('--loose-h', `${Math.max(h0, h1)}px`);
    looseHeight = Math.max(h0, h1);
    bar.style.setProperty('--k', k);
    bar.style.marginBottom = mb;
    if (stuck) bar.classList.add('is-stuck');
    if (compact) bar.classList.add('is-compact');
  }

  let m = null;
  function measure() {
    reserveHeight();
    fitPinned();
    const r = logo.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(logo);
    const t = text.getBoundingClientRect();
    const big = parseFloat(getComputedStyle(logo).fontSize);
    const small = parseFloat(getComputedStyle(slot).fontSize);
    const scale = small / big;
    bar.style.setProperty('--slot-w', `${t.width * scale}px`);
    // the bar's own MH, measured where it sits once the bar is pinned at the top
    const st = document.createRange();
    st.selectNodeContents(slot);
    const sr = st.getBoundingClientRect(), br = bar.getBoundingClientRect();
    m = {
      left: t.left,
      top: r.top + window.scrollY,                // page position of the logo box
      pin: sentinel.getBoundingClientRect().top + window.scrollY, // scroll where the bar pins
      endLeft: sr.left,
      endTop: sr.top - br.top + (r.top - t.top) * scale, // line up glyphs, bar at top of screen
      scale,
    };
    flyer.style.left = `${t.left}px`;
    flyer.style.top = `${r.top + window.scrollY}px`;
    update();
  }

  const ease = (x) => x * x * (3 - 2 * x); // smoothstep: gentle start and landing
  const lerp = (a, b, x) => a + (b - a) * x;

  const heading = document.querySelector('.site-header h1');
  // on phones the heading sits under the logo and scrolls up beneath it:
  // a soft mask hides each line as it reaches the bottom of the logo
  function fadeHeading(k) {
    if (!heading) return;
    const clear = () => { heading.style.maskImage = heading.style.webkitMaskImage = ''; };
    if (k === 0) return clear();
    const a = flyer.getBoundingClientRect(), h = heading.getBoundingClientRect();
    const under = a.right > h.left && a.left < h.right;
    const cut = a.bottom - h.top + 4; // px into the heading that are behind the logo
    if (!under || cut <= 0) return clear();
    const mask = `linear-gradient(to bottom, transparent ${cut}px, #000 ${cut + 24}px)`;
    heading.style.maskImage = heading.style.webkitMaskImage = mask;
  }

  let state = '';
  function show(next) {
    if (next === state) return;
    state = next;
    logo.style.visibility = next === 'rest' ? '' : 'hidden';
    flyer.style.visibility = next === 'moving' ? 'visible' : 'hidden';
    slot.classList.toggle('is-shown', next === 'landed');
  }

  function update() {
    if (!m) return;
    const k = ease(Math.min(Math.max(window.scrollY / m.pin, 0), 1));
    bar.style.setProperty('--k', k);
    if (k === 0) { show('rest'); fadeHeading(0); return; }
    // the copy is fixed to the screen at the logo's starting point; move it toward the bar
    const tx = lerp(0, m.endLeft - m.left, k);
    const ty = lerp(0, m.endTop - m.top, k);
    flyer.style.transform = `translate(${tx}px, ${ty}px) scale(${lerp(1, m.scale, k)})`;
    show(k === 1 ? 'landed' : 'moving');
    fadeHeading(k);
  }

  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }

  // the travelling and landed MH take you back to the top
  // (the header logo is hidden until the page is back at the top, so focus it once the scroll ends)
  const toTop = (e) => {
    e.preventDefault();
    const focusLogo = () => setTimeout(() => logo.focus({ preventScroll: true }), 50);
    if ('onscrollend' in window) window.addEventListener('scrollend', focusLogo, { once: true });
    else setTimeout(focusLogo, 700);
    window.scrollTo({ top: 0 });
  };
  flyer.addEventListener('click', toTop);
  slot.addEventListener('click', toTop);

  function setup() {
    document.documentElement.classList.toggle('reduce-motion', reduce.matches);
    window.removeEventListener('scroll', onScroll);
    if (reduce.matches) {
      m = null; state = '';
      logo.style.visibility = ''; flyer.style.visibility = 'hidden'; slot.classList.remove('is-shown');
      bar.style.setProperty('--k', 0);
      if (heading) heading.style.maskImage = heading.style.webkitMaskImage = '';
      return;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
  }
  reduce.addEventListener('change', setup);
  const remeasure = () => {
    if (reduce.matches) return;
    // measure from the page's resting layout
    const y = window.scrollY;
    bar.style.setProperty('--k', 1);
    measure();
    if (window.scrollY !== y) window.scrollTo(0, y);
  };
  window.addEventListener('resize', remeasure);
  document.fonts?.ready.then(remeasure);
  window.addEventListener('load', remeasure);
  setup();
})();
