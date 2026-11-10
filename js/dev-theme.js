// Dev-only light/dark switch. js/main.js loads this file only on localhost, so it never
// runs on martinhofseth.com. It needs no CSS of its own: it rewrites the media condition
// on the stylesheet's `@media (prefers-color-scheme: dark)` block so it always or never
// matches, and the dark tokens in style.css do the rest.
(function () {
  const KEY = 'dev-theme';
  const MODES = ['auto', 'light', 'dark'];
  const QUERY = '(prefers-color-scheme: dark)';

  // every @media rule in our own stylesheets that tests the system colour scheme
  const rules = [];
  for (const sheet of document.styleSheets) {
    let list;
    try { list = sheet.cssRules; } catch (e) { continue; } // cross-origin sheet
    for (const rule of list) {
      if (rule instanceof CSSMediaRule && rule.media.mediaText.includes('prefers-color-scheme')) {
        rules.push(rule);
      }
    }
  }

  function apply(mode) {
    const text = mode === 'dark' ? 'all' : mode === 'light' ? 'not all' : QUERY;
    rules.forEach((rule) => { rule.media.mediaText = text; });
    // keep scrollbars and form controls in step with the forced theme
    document.documentElement.style.colorScheme = mode === 'auto' ? '' : mode;
    button.textContent = 'Theme: ' + mode;
    try { localStorage.setItem(KEY, mode); } catch (e) { /* storage blocked: fine */ }
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.title = 'Dev only: cycle auto / light / dark';
  button.style.cssText = [
    'position:fixed', 'left:12px', 'bottom:12px', 'z-index:1000',
    'font:500 12px/1 system-ui, sans-serif', 'padding:8px 12px',
    'border-radius:999px', 'border:1px solid #888', 'cursor:pointer',
    'background:#ffeb3b', 'color:#000', 'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
  ].join(';');
  button.addEventListener('click', () => {
    const next = MODES[(MODES.indexOf(current()) + 1) % MODES.length];
    apply(next);
  });

  function current() {
    const m = (button.textContent || '').replace('Theme: ', '');
    return MODES.includes(m) ? m : 'auto';
  }

  let saved = 'auto';
  try { saved = localStorage.getItem(KEY) || 'auto'; } catch (e) { /* ignore */ }
  document.body.appendChild(button);
  apply(MODES.includes(saved) ? saved : 'auto');
})();
