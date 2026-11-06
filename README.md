# martinhofseth.com

Martin Hofseth's portfolio. Plain HTML, CSS and a little JavaScript: no framework, no build step.
Hosted on GitHub Pages from the `main` branch.

> **Pushing to `main` publishes the site.** Every push to `main` goes live on
> martinhofseth.com within a few minutes. To save work without publishing, push to another branch.

## Run it locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. (`.claude/launch.json` holds the same command.)

## Publish

1. Commit to `main` and push.
2. GitHub builds and deploys automatically. It usually takes under a minute, but can take 5–10 when GitHub is slow.
3. Check progress: `gh run list -R MaHofseth/martinhofseth.com -L 3`, or the repo's **Actions** tab.
   - A run marked **cancelled** usually just means a newer push replaced it. That's fine.
   - A **timeout** in the deploy step is on GitHub's side. Press **Re-run jobs**, or push again.

### Bump the cache version when CSS or JS changes

Browsers and GitHub cache `style.css` and the scripts for about 10 minutes, so every page links them
with `?v=N`. If you change anything in `css/` or `js/`, raise the number on **every** page, or
visitors may get new HTML with old styles:

```bash
# replace 32 → 33 with the current and next number
sed -i '' 's/?v=32/?v=33/g' *.html Portraits/index.html
```

## Files

```
index.html               Home: intro, filter bar, project list, About footer
rockslo.html …           One page per project (see "Project order" below)
Portraits/index.html     Lives in a folder so the address is /Portraits (paths use ../)
whee.html                Kept but hidden: not linked anywhere, and noindex
archive.html             Old address; redirects to the home page
css/style.css            All styling
js/filter.js             Tag filter, pinned bar, and the MH logo that glides into it
js/main.js               Image lightbox, click-to-load video/Figma embeds
js/lang.js               English / Norwegian switch
fonts/                   Archivo, self-hosted (SIL Open Font License, see OFL.txt)
images/                  All site images
CNAME                    The custom domain. Don't delete it
```

Not in git (see `.gitignore`): `cargo-backup/` (unused images saved from the old Cargo site) and
`_fonts.html` (a local page for comparing fonts).

## Common edits

### Text

Edit the HTML directly. All text exists in **English and Norwegian**, side by side, and only the active
language shows:

```html
<span lang="en">Photography</span><span lang="nb">Fotografi</span>
```

- Whole paragraphs: wrap each language in its own `<div lang="en">` / `<div lang="nb">`.
- Attributes (alt, aria-label, title): put English in the attribute and Norwegian in `data-<attr>-nb`,
  e.g. `alt="Portrait" data-alt-nb="Portrett"`.
- Page title: `<title data-nb="Norsk tittel">English title</title>`.

The details are at the top of `js/lang.js`.

### Images

Put the file in `images/`, then:

```html
<img class="zoomable" src="images/name.jpg" width="2000" height="1500" alt="…" data-alt-nb="…" loading="lazy">
```

- Always give the real `width` and `height`. The browser uses them to reserve space, so the page doesn't jump while images load.
- `class="zoomable"` makes the image open in the lightbox when clicked.
- Rows of images: `<div class="gallery">` gives 3 equal columns. For equal *heights* instead, use
  `class="gallery same-h"` and give each image its width ÷ height as a decimal, e.g. `style="--ar:0.8"`
  for 1500×1875 (see the Portraits row on the home page).
- A tall photo that shouldn't be taller than the screen: add `class="fit-screen"` (see `snoblind.html`).

### Tags and the filter

Tags live on each project in `index.html`:

```html
<span class="tag" data-tag="Photography"><span lang="en">Photography</span><span lang="nb">Fotografi</span></span>
```

The filter bar builds itself from these tags, most-used first, so there's no list to keep in sync.
`data-tag` (English) is the tag's ID, used in shareable links like `/?tags=Photography`. Projects with the
same tag must use the exact same `data-tag`.

### Add a project

1. Copy a similar project page (e.g. `rockslo.html`) and change the title, header, text and images.
2. In `index.html`, copy a `<section class="project">` block. Point it at the new page, and set the
   title, year, description, tags and preview image.
3. Update the **Next →** link at the bottom of the project before it, and point the new page's Next
   link at the following one (the last page loops back to Rockslo).

### Project order

The order is the order of the `<section class="project">` blocks in `index.html`, plus the chain of
**Next →** links at the bottom of each project page. Change both together. Current order:

Rockslo → Eversnow → "Du er her" → AI zines → Snøblind → Portraits → Natur&Miljø → Eksponeringsterapi → (Rockslo)

### Video and Figma embeds

These don't load YouTube or Figma until the visitor clicks, so no data goes to them before then. Use a
`click-embed` box with the real address in `data-embed-src`; copy the one in `eversnow.html`.

## How the layout works

- **Grid:** 12 columns. `<div class="cols">` with children `s1`–`s12`, each spanning that many columns.
  Below 768px wide, everything stacks into one column.
- **Scaling:** all sizes are in `rem`, and the root font size follows the window
  (`html { font-size: min(1.44vh, 1.53vw) }`, a different formula on phones). The whole site scales
  together, like the old Cargo site did. To make something bigger or smaller, change its `rem` value.
- **Pinned filter bar and logo** (`js/filter.js`): as you scroll down, a fixed copy of the MH logo
  shrinks toward the bar and lands as the bar pins. After that, the bar's own MH takes over. The bar
  reserves its final height in advance, so the page never changes height while scrolling. Avoid changes
  that make the bar's height depend on scroll position: that caused a bouncing bug before.
- **Pinned bar is always one row.** If the tags don't fit, they fold behind a **Filter** button
  (always on phones; on desktop only while pinned).

## Domain and DNS

The domain is registered at **Hover**, and DNS is managed there.

| Record | Value | Purpose |
|---|---|---|
| A ×4 | 185.199.108.153, .109.153, .110.153, .111.153 | GitHub Pages |
| MX, TXT, CNAME (Proton) | as set up by Proton Mail | Email at @martinhofseth.com |

Don't touch the Proton Mail records when changing anything for the website. HTTPS is handled by
GitHub (repo **Settings → Pages → Enforce HTTPS**).
