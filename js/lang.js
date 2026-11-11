// English / Norwegian switch.
// Loaded in <head> (not deferred) so the saved language is set before the page is drawn.
//
// How to write bilingual content:
//   - Text: put both versions side by side, each marked with its language:
//       <span lang="en">Photography</span><span lang="nb">Fotografi</span>
//     For whole paragraphs, wrap each language's paragraphs in its own <div lang="…">.
//     CSS (css/style.css, "Language") hides whichever language is not active.
//   - Attributes: the HTML holds the English value; add the Norwegian one as data-<attr>-nb,
//     e.g. alt="Portrait" data-alt-nb="Portrett". Works for alt, aria-label, title and content.
//   - Page title: <title data-nb="Norwegian title">English title</title>
(function () {
  const KEY = 'lang';
  const ATTRS = ['alt', 'aria-label', 'title', 'content'];
  const root = document.documentElement;

  let lang = 'en';
  try { if (localStorage.getItem(KEY) === 'nb') lang = 'nb'; } catch (e) { /* storage blocked */ }
  root.lang = lang;

  window.siteLang = () => root.lang === 'nb' ? 'nb' : 'en';

  function applyAttributes() {
    const nb = window.siteLang() === 'nb';
    ATTRS.forEach((attr) => {
      document.querySelectorAll(`[data-${attr}-nb]`).forEach((el) => {
        const enKey = `data-${attr}-en`;
        if (!el.hasAttribute(enKey)) el.setAttribute(enKey, el.getAttribute(attr) || '');
        el.setAttribute(attr, el.getAttribute(nb ? `data-${attr}-nb` : enKey));
      });
    });
    const title = document.querySelector('title[data-nb]');
    if (title) {
      if (!title.dataset.en) title.dataset.en = title.textContent;
      title.textContent = nb ? title.dataset.nb : title.dataset.en;
    }
  }

  let button = null;
  function updateButton() {
    if (!button) return;
    const nb = window.siteLang() === 'nb';
    button.setAttribute('aria-label', nb ? 'Språk: norsk. Bytt til engelsk (English)' : 'Language: English. Switch to Norwegian (norsk)');
  }

  function setLang(next) {
    root.lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) { /* storage blocked */ }
    applyAttributes();
    updateButton();
    document.dispatchEvent(new CustomEvent('langchange', { detail: next }));
    // text lengths changed: let the header and pinned-bar code re-measure
    window.dispatchEvent(new Event('resize'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyAttributes();
    // the switch lives on the front page only; other pages just follow the saved language
    const header = document.querySelector('.site-header');
    if (!header) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-toggle';
    button.innerHTML = '<span aria-hidden="true">EN</span><span aria-hidden="true">NO</span>';
    button.addEventListener('click', () => setLang(window.siteLang() === 'nb' ? 'en' : 'nb'));
    header.appendChild(button);
    updateButton();
  });
})();
