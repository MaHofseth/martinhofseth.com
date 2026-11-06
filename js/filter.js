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

// thin line under the bar once it sticks to the top
(function () {
  const bar = document.querySelector('.filters');
  if (!bar || getComputedStyle(bar).position !== 'sticky') return;
  const sentinel = document.createElement('div');
  bar.before(sentinel);
  new IntersectionObserver(([e]) => bar.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
})();
