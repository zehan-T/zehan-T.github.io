# Zehan Tian — Soprano

A personal website for a classical singer: plain HTML and CSS, no build step, no
dependencies, no framework. Open `index.html` in a browser and it works.

Built in the same shape as the singer-portfolio sites it was modelled on
(ruoxibian.com, jinnishen.com, elisemillervoice.com) — home / about / media /
gallery / calendar / contact — but with its own typography, palette and a few
things those sites don't have.

There is no `repertoire.html` — the performance list lives on `calendar.html`,
most recent first, upcoming dates pinned above it.

---

## Getting it on screen

**Just look at it:** double-click `index.html`.

**Better — run a tiny local server** (some things, like the fonts and the
lightbox, behave more like the real thing over `http://`):

```bash
# any one of these, from inside this folder
python -m http.server 8000
npx serve .
php -S localhost:8000
```

Then open <http://localhost:8000>.

---

## What's here

```
personal_website/
├── index.html          Home — full-bleed cover photo, "next on stage", intro, video, photos
├── about.html          One continuous biography + CV/résumé downloads
├── media.html          Inline-playing video (YouTube facade) + audio players
├── gallery.html        Masonry photo grid + lightbox
├── calendar.html       Upcoming dates, then the full performance history
├── studio.html         Voice lessons and teaching history
├── contact.html        Details and a message form
├── 404.html            Not-found page
│
├── assets/
│   ├── css/
│   │   ├── tokens.css      ← EVERY colour, font and size lives here
│   │   ├── base.css        Reset, typography, layout, bilingual plumbing
│   │   └── components.css  Nav, hero, ledger, calendar, gallery, player…
│   ├── js/
│   │   └── site.js         Enhancement only — the site works without it
│   └── images/
│       ├── hero/           Homepage cover photo (multiple crops/sizes)
│       ├── gallery/        Gallery photos (2 sizes each)
│       ├── video/          YouTube poster frames for the facade player
│       └── og/             Social-sharing preview image
│   ├── video/          ← put self-hosted .mp4 files here
│   ├── audio/          ← put .mp3 files here
│   └── docs/           ← CV / résumé / press kit PDFs
│
├── README.md           This file
└── CONTENT-GUIDE.md    Copy-paste recipes for adding content
```

Everything you upload goes in `assets/`, sorted by kind. Nothing else in the
project needs to know where it came from.

---

## Changing the look

Open **`assets/css/tokens.css`**. That one file holds every colour, typeface,
size and spacing value used anywhere on the site. Nothing else hard-codes a
colour.

The default palette was sampled from the homepage photograph — the charcoal of
the gown, the dusty rose of the bouquet, the sage green of the backlit trees,
warm ivory paper. To go somewhere completely different, change these four
values and the whole site follows:

```css
--paper:  #F7F3EB;   /* page background */
--ink:    #201D1A;   /* headings and text */
--accent: #8E5C6C;   /* the one colour that draws the eye */
--sage:   #6F7E61;   /* secondary accent */
```

Typefaces are two lines further up:

```css
--font-display: "Cormorant Garamond", …;   /* headings, names, opera titles */
--font-body:    "Inter", …;                 /* everything else */
```

If you switch to a font that isn't already loaded, update the Google Fonts
`<link>` in the `<head>` of each `.html` file too.

There are two themes — `day` (warm ivory) and `night` (dark auditorium) — and
both are defined in `tokens.css`. If you edit the day palette, give the night
block the same treatment or it will drift.

---

## Changing the words

All text is in the HTML, right where you see it on the page. There is no CMS
and no data file to hunt through — find the sentence, edit the sentence.

### The site is bilingual

Both languages sit side by side in the markup:

```html
<p>
  <span data-lang="en">Soprano</span>
  <span data-lang="zh">女高音</span>
</p>
```

CSS shows whichever one matches `<html lang>`; the **EN / 中** switch in the
header flips it. This means:

- both translations are always next to each other, so they can't drift apart
- there are no translation keys to keep in sync
- adding a language is adding a span

If you only want one language, delete the `.lang-switch` block from the header
of each page and remove the spans you don't need.

### Editing the navigation

The header and footer are copied into all eight `.html` files — the ordinary
trade-off for having no build step. If you add or rename a page, update the
`<nav>` block in each file. The current page is marked with
`aria-current="page"`, which is what underlines it.

### The video facade

A YouTube `<iframe>` pulls in a fair amount of Google's own script before
anyone has pressed play. To keep the page fast, every video on `media.html`
(and the one featured on the homepage) starts as a plain image with our own
play button drawn on top — a "facade". The real embed is only created once you
click it, and it plays right there inline; it never navigates you to
youtube.com.

```html
<button class="video-facade" type="button"
        data-video="dQw4w9WgXcQ"
        data-title="Track title, for screen readers">
  <img src="assets/images/video/dQw4w9WgXcQ.jpg" width="1280" height="720"
       loading="lazy" alt="">
  <span class="video-facade__play" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>
  </span>
</button>
```

`data-video` is the id from the YouTube URL (the part after `watch?v=` or
`youtu.be/`). Grab a poster image for it with:

```
https://i.ytimg.com/vi/<id>/maxresdefault.jpg
```

`site.js` handles the click. See CONTENT-GUIDE.md § 3 for the full recipe,
including the plain `<video>` version for a self-hosted `.mp4`.

---

## The things this site does that the templates don't

- **Bilingual English / 中文** from one set of files, switched in pure CSS.
- **Day / night themes** ("house lights"), following the visitor's system
  setting until they choose for themselves.
- **A performance history set like a recital programme** — role, work,
  composer, company, season — instead of a wall of prose.
- **A calendar that ages itself.** Give a date `data-date="2026-04-17"` and the
  row dims automatically the day after the performance. No annual tidy-up.
- **A "next on stage" strip** directly under the homepage portrait, so the most
  useful fact on the site is the first thing read.
- **YouTube videos that play on the page, not on youtube.com.** Each video
  starts as a still frame with our own play button; the real embed only loads
  once you press play (see "The video facade" below).
- **A drawn "breath line"** under the name — one stroked phrase, animated once.
- **A custom audio player** with a waveform-style progress bar you can click to
  seek. (The waveform is a deterministic pattern, not real audio analysis — it
  is decoration that shows progress, and honest about being that.)
- **A gallery lightbox** with arrow-key navigation, neighbour preloading and
  proper focus handling.
- **A print stylesheet**, so `Ctrl-P` on the calendar page gives a clean sheet
  to hand to a presenter.

Accessibility and performance were part of the build, not an afterthought: skip
link, visible focus rings, `aria-current`, real `<button>`s for the gallery,
`prefers-reduced-motion` honoured throughout, images sized to prevent layout
shift, and total page weight in the low hundreds of kilobytes.

---

## Publishing it

The site is static files, so almost anything will host it for free.

**GitHub Pages**

```bash
cd personal_website
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: `main`, folder `/ (root)`**.

A `.nojekyll` file is already included so GitHub serves the folder as-is.

**Netlify / Cloudflare Pages / Vercel** — drag the folder onto their dashboard,
or point them at the repository. Build command: none. Publish directory: `.`

**Custom domain** — add it in your host's dashboard, then update the two
`<meta property="og:image">` paths to absolute URLs (`https://yourdomain.com/…`)
so link previews work when the site is shared.

---

## Before it goes live

- [x] CV and résumé are in `assets/docs/` and linked from `about.html`,
      `media.html` and `contact.html`
- [x] Social links point at real profiles (Instagram, email)
- [x] Two YouTube performances are wired up on `media.html` and the homepage
- [ ] Add audio to `assets/audio/`, then follow the instructions in
      `media.html` — there's no track uploaded yet
- [ ] Decide about the phone number — see the commented block in `contact.html`
- [ ] Fill in or remove the rates row in `studio.html`
- [ ] Set the real date for the Queen of the Night debut in `calendar.html`
      once it's confirmed (currently "TBA, 2027")
- [ ] Update `sitemap.xml` and the two `og:image` URLs once the site has a
      real domain (they still say `example.com`)
