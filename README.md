# martinhofseth.com

A plain HTML/CSS rebuild of the Cargo site (mhofseth.cargo.site). No build step.

```
index.html          Home: intro, project list, About (black footer)
rockslo.html        Project pages, linked from the home page
du-er-her.html
snoblind.html
eversnow.html
natur-miljo.html
whee.html
archive.html        The "(++)" page
css/style.css       All styling (sizes, colors, grid)
js/main.js          Click-to-zoom lightbox for images with class="zoomable"
js/lang.js          English / Norwegian switch (EN | NO, top right)
images/             All 38 images, original quality
```

## Preview locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Editing

- Text: edit the HTML files directly.
- Every text exists in English and Norwegian. Write both, side by side:
  `<span lang="en">Photography</span><span lang="nb">Fotografi</span>` (whole paragraphs:
  wrap each language in `<div lang="en">` / `<div lang="nb">`). Only the chosen language shows.
  For alt text and other attributes, add the Norwegian as `data-alt-nb="…"` (see `js/lang.js`).
- New image: put it in `images/` and add `<img class="zoomable" src="images/name.jpg" width="…" height="…" alt="…">`.
- Layout uses a 12-column grid like Cargo: `<div class="cols">` with children `s1`–`s12` (column span).
- Sizes scale with the window exactly like the Cargo site (see the top of `css/style.css`).

## Fonts

The Cargo site used Neue Haas Grotesk and Diatype, which are licensed through Cargo and
can't be self-hosted without buying a license. This version uses Helvetica Neue (body) and
Inter (headings). If you buy the fonts, add the files in `fonts/`, add `@font-face` rules,
and the font stacks at the top of `css/style.css` will pick them up.

## Hosting (free)

Any static host works. Easiest options:

- **Netlify** or **Cloudflare Pages**: drag this folder into the dashboard, or connect a GitHub repo.
- **GitHub Pages**: push to a repo and enable Pages in its settings.

Then point your domain (e.g. martinhofseth.com) at the host using its DNS instructions.
