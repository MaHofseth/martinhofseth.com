// Dev only: on localhost, load a light/dark test switch (js/dev-theme.js). Never runs in production.
if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  const s = document.createElement('script');
  s.src = new URL('dev-theme.js', document.currentScript.src).href;
  document.body.appendChild(s);
}

// Click-to-zoom lightbox for images marked .zoomable (like Cargo's quick view)
(function () {
  const images = Array.from(document.querySelectorAll('img.zoomable'));
  if (!images.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.dataset.ariaLabelNb = 'Bildevisning';
  box.innerHTML =
    '<img alt="">' +
    '<button class="close" aria-label="Close" data-aria-label-nb="Lukk">&#215;</button>' +
    '<button class="prev" aria-label="Previous image" data-aria-label-nb="Forrige bilde">&#8592;</button>' +
    '<button class="next" aria-label="Next image" data-aria-label-nb="Neste bilde">&#8594;</button>';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  const closeBtn = box.querySelector('.close');
  let index = 0;
  let opener = null; // the thumbnail that opened the viewer, to return focus to

  function show(i) {
    index = (i + images.length) % images.length;
    big.src = images[index].currentSrc || images[index].src;
    big.alt = images[index].alt;
  }
  function open(i) {
    opener = images[i];
    show(i);
    box.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (opener) opener.focus();
  }

  // thumbnails can be reached with Tab and opened with Enter or Space
  images.forEach((img, i) => {
    img.tabIndex = 0;
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  box.addEventListener('click', close);
  box.querySelector('.prev').addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
  box.querySelector('.next').addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
  if (images.length < 2) box.querySelectorAll('.prev, .next').forEach((b) => (b.hidden = true));

  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      // keep focus inside the viewer while it is open
      const btns = Array.from(box.querySelectorAll('button:not([hidden])'));
      const at = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(at + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  });
})();

// Click-to-load embeds (YouTube, Figma): the third-party iframe is only created when the
// visitor presses the button, so nothing is sent to those services before that.
document.querySelectorAll('.click-embed').forEach((box) => {
  const btn = box.querySelector('.embed-load');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = box.dataset.embedSrc;
    f.title = box.dataset.embedTitle || '';
    if (box.dataset.embedAllow) f.allow = box.dataset.embedAllow;
    f.allowFullscreen = true;
    btn.replaceWith(f);
    f.focus();
  });
});
