// Click-to-zoom lightbox for images marked .zoomable (like Cargo's quick view)
(function () {
  const images = Array.from(document.querySelectorAll('img.zoomable'));
  if (!images.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML =
    '<img alt="">' +
    '<button class="prev" aria-label="Previous image">&#8592;</button>' +
    '<button class="next" aria-label="Next image">&#8594;</button>';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  let index = 0;

  function show(i) {
    index = (i + images.length) % images.length;
    big.src = images[index].currentSrc || images[index].src;
    big.alt = images[index].alt;
  }
  function open(i) {
    show(i);
    box.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.documentElement.style.overflow = '';
  }

  images.forEach((img, i) => img.addEventListener('click', () => open(i)));
  box.addEventListener('click', close);
  box.querySelector('.prev').addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
  box.querySelector('.next').addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
  if (images.length < 2) box.querySelectorAll('button').forEach((b) => (b.hidden = true));

  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
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
