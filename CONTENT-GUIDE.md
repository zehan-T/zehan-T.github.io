# Content guide

Copy-paste recipes for the things you'll do most often. Every snippet is real
markup from the site — paste it, change the words, save, refresh.

**A rule that saves pain:** whenever you add text, add both languages. The
English span and the Chinese span always travel together.

---

## 1. Adding a photograph to the gallery

**Step 1 — make two sizes.** The gallery grid uses a small one and the lightbox
uses a large one. Long edge 1000px and 1800px, JPEG quality ~82.

Name them the same way as the existing files:

```
assets/images/gallery/recital-2026-1000.jpg
assets/images/gallery/recital-2026-1800.jpg
```

If you don't have an image editor handy, [squoosh.app](https://squoosh.app)
resizes and compresses in the browser without uploading anything.

**Step 2 — paste this into the `<ul class="masonry">` in `gallery.html`:**

```html
<li class="masonry__item">
  <button class="photo" type="button"
          data-full="assets/images/gallery/recital-2026-1800.jpg"
          data-caption="Bass Concert Hall · March 2026">
    <img src="assets/images/gallery/recital-2026-1000.jpg"
         width="667" height="1000" loading="lazy" decoding="async"
         alt="Zehan Tian on stage in a red gown, mid-phrase.">
    <span class="photo__caption">Bass Concert Hall &middot; March 2026</span>
  </button>
</li>
```

- `data-full` — the big file the lightbox opens
- `data-caption` — shown on hover and in the lightbox
- `alt` — describe what is happening, for screen readers and for when the image
  fails to load. Not "photo of me".
- `width`/`height` — the *small* file's real pixel size. These stop the page
  jumping around as images load, so keep them accurate.

Order in this list is the order on the page **and** in the lightbox.

---

## 2. Adding an audio track

**Step 1** — put the file in `assets/audio/`, e.g.
`assets/audio/der-hoelle-rache.mp3`.

**Step 2** — paste into the `<div class="tracks">` in `media.html`, and delete
the `<div class="slot">` placeholder once you have at least one track:

```html
<article class="track">
  <button class="track__play" type="button" aria-label="Play">
    <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>
    <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>
  </button>
  <div class="track__body">
    <p class="track__title">Der Hölle Rache</p>
    <p class="track__meta"><cite class="work">Die Zauberflöte</cite> &middot; Mozart &middot; 2026</p>
    <div class="wave" role="slider" tabindex="0" aria-label="Seek"></div>
    <p class="track__time">0:00</p>
    <audio preload="metadata" src="assets/audio/der-hoelle-rache.mp3"></audio>
  </div>
</article>
```

The waveform bars, the play/pause swap, the timer and click-to-seek all wire
themselves up. Leave `<div class="wave">` empty — it gets filled in by
`site.js`.

Keep files under about 8 MB so the page stays quick. 192 kbps MP3 is plenty for
a website.

---

## 3. Adding a video

**A YouTube link — the normal case.** Videos on this site don't embed a live
YouTube player up front; they start as a still photo with our own play button
(a "facade"), and only turn into a real, inline-playing embed once someone
clicks. That keeps the page fast and keeps playback happening here, not on
youtube.com.

**Step 1** — get the video id. It's the part of the URL after `watch?v=` or
after `youtu.be/`:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ    →  id is dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ                    →  id is dQw4w9WgXcQ
```

**Step 2** — download a poster frame into `assets/images/video/`:

```
https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
```

(If that URL 404s — not every video has a maxres thumbnail — try
`sddefault.jpg` or `hqdefault.jpg` instead.)

**Step 3** — paste this into `media.html`, inside the `<div class="grid-2">`
under "Watch":

```html
<figure class="video-card">
  <div class="video-card__frame">
    <button class="video-facade" type="button"
            data-video="dQw4w9WgXcQ"
            data-title="Der Hölle Rache — Die Zauberflöte"
            aria-label="Play: Der Hölle Rache">
      <img src="assets/images/video/dQw4w9WgXcQ.jpg"
           width="1280" height="720" loading="lazy" decoding="async" alt="">
      <span class="video-facade__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>
      </span>
    </button>
  </div>
  <figcaption>
    <p class="video-card__title">Der Hölle Rache</p>
    <p class="video-card__meta"><cite class="work">Die Zauberflöte</cite> &middot; 2026</p>
  </figcaption>
</figure>
```

`site.js` does the rest: on click, it replaces the button with a real
`youtube-nocookie.com` iframe that starts playing immediately, inline, right
where the still photo was.

**Your own file instead of YouTube.** Put the `.mp4` in `assets/video/` and use
a plain `<video>` in place of the `<button class="video-facade">` — no facade
needed, since there's no third-party script to hold back:

```html
<figure class="video-card">
  <div class="video-card__frame">
    <video controls preload="metadata"
           poster="assets/images/gallery/pamina-solo-1000.jpg">
      <source src="assets/video/recital-2026.mp4" type="video/mp4">
    </video>
  </div>
  <figcaption>
    <p class="video-card__title">Recital excerpt</p>
    <p class="video-card__meta">Austin, Texas &middot; 2026</p>
  </figcaption>
</figure>
```

Hosting video yourself is heavy — a five-minute clip can be 100 MB+, and GitHub
Pages will serve it slowly. YouTube is usually the better answer, which is why
it's the default above.

---

## 4. Adding a performance date

Paste into the `<div class="dates">` in `calendar.html`:

```html
<article class="date-row" data-date="2026-04-17">
  <div class="date-row__when">
    <span class="date-row__day">17</span>
    <span class="date-row__month" data-lang="en">Apr</span>
    <span class="date-row__month" data-lang="zh">四月</span>
    <span class="date-row__year">2026</span>
  </div>
  <div class="date-row__what">
    <h3><cite class="work">Die Zauberflöte</cite></h3>
    <p class="date-row__role">
      <span data-lang="en">Queen of the Night</span>
      <span data-lang="zh">夜女王</span>
    </p>
    <p class="date-row__where">Bass Concert Hall &middot; Austin, Texas</p>
  </div>
  <div>
    <a class="btn btn--ghost" href="https://tickets.example.com">
      <span data-lang="en">Tickets</span><span data-lang="zh">购票</span>
    </a>
  </div>
</article>
```

`data-date` is the useful bit: **the row dims itself the day after that date**,
so the calendar stays honest without you touching it.

While a date is still unconfirmed, leave `data-date` off entirely and lead with
the year instead of the day — that's how the Queen of the Night debut is set
up right now, under "Upcoming":

```html
<div class="date-row__when">
  <span class="date-row__day date-row__day--year">2027</span>
  <span class="date-row__month" data-lang="en">TBA</span>
  <span class="date-row__month" data-lang="zh">待定</span>
</div>
```

The `--year` modifier just shrinks the type so four digits fit the column.
Once you know the day, swap back to the `17 / Apr / 2027` form above and add
`data-date`.

The fourth `<div>` is optional. Use it for a ticket link, or a
`<span class="tag tag--accent">` badge, or leave it out.

---

## 5. Adding a role to the performance history

There is no separate repertoire page — every role, cover, scene and concert
appearance lives on `calendar.html`, under "Performance history", most recent
first. Paste a new entry into that `<div class="dates">`:

```html
<article class="date-row">
  <div class="date-row__when">
    <span class="date-row__day date-row__day--year">2027</span>
    <span class="date-row__month" data-lang="en">Season</span>
    <span class="date-row__month" data-lang="zh">演出季</span>
  </div>
  <div class="date-row__what">
    <h3><cite class="work">La bohème</cite></h3>
    <p class="date-row__role">
      <span data-lang="en">Musetta &middot; Puccini</span>
      <span data-lang="zh">穆塞塔 &middot; 普契尼</span>
    </p>
    <p class="date-row__where">Opera San Antonio &middot; San Antonio, Texas</p>
  </div>
</article>
```

Badges you can drop in the optional fourth `<div>`:

```html
<span class="tag" data-lang="en">Cover</span><span class="tag" data-lang="zh">备角</span>
<span class="tag tag--accent" data-lang="en">Debut</span><span class="tag tag--accent" data-lang="zh">首演</span>
<span class="tag" data-lang="en">Scenes</span><span class="tag" data-lang="zh">选段</span>
```

Opera titles go in `<cite class="work">` — that's what makes them italic, and
it stays italic in Chinese mode too (see base.css: any `.work` or `<cite>`
keeps its slant even inside an upright Chinese sentence).

---

## 6. Adding a press quote

There's a ready-made pull-quote style. Drop this anywhere, for instance on the
homepage under the introduction:

```html
<blockquote class="pullquote reveal">
  <p>
    <span data-lang="en">…a Queen of the Night of real steel and real charm.</span>
    <span data-lang="zh">……一位既有钢骨又有魅力的夜女王。</span>
  </p>
  <footer>Reviewer Name &middot; Publication &middot; 2026</footer>
</blockquote>
```

---

## 7. Swapping the homepage cover photo

The homepage hero is a full-bleed photograph with a dark scrim and the name
sitting on top of it — built to suit `cover.JPG`, a wide studio shot with a
large empty area on one side. Replace the four generated files in
`assets/images/hero/`, keeping the names:

| File | Long edge | Used for |
|---|---|---|
| `cover-1200.jpg` | 1200px | phones and the smallest `srcset` step |
| `cover-2000.jpg` | 2000px | the `src` fallback and mid-size screens |
| `cover-2800.jpg` | 2800px | large / retina displays |
| `cover-portrait-1100.jpg` | — | a portrait-shaped crop, shown only below 900px width |

If your new photo has empty space on a *different* side than this one, the
easiest fix is in `components.css`, `.hero__media img`:

```css
.hero__media img { object-position: 64% 28%; }
/*                                  ↑    ↑
                        horizontal      vertical — this keeps her face in
                        frame as the box changes shape at different widths */
```

The dark scrim behind the type (`.hero::after`) is deliberately independent of
which theme (day/night) is active — it's there so light text stays readable
against *any* photograph, not just this one. If a future photo is naturally
dark on the side the text sits on, you can lighten or remove the scrim for
that photo; see the comment above `.hero` in `components.css`.

If the new photo is a very different shape (portrait instead of landscape,
say), you may not need the separate portrait crop at all — delete the
`<source media="(max-width: 899px)">` line in `index.html` and let the one
image handle every width.

---

## 8. Adding a whole new page

1. Copy the file closest to what you want (`about.html` for prose,
   `calendar.html` for lists of dated entries).
2. Change `<title>`, the `<meta name="description">` and both `og:` tags.
3. Add a `<li>` to the `<nav>` — **in all eight `.html` files**, or the
   navigation will disagree with itself.
4. On the new page only, put `aria-current="page"` on its own nav link, and
   take it off whichever link had it before.
5. If the page needs the light-on-dark header treatment used on the homepage
   (see `.page-home` in `components.css`), add `class="page-home"` to its
   `<body>` tag and give it its own dark hero — otherwise leave the `<body>`
   class empty, as on every page except `index.html`.

---

## 9. Reveal-on-scroll

Add `class="reveal"` to anything and it fades up as it comes into view. For a
staggered group, put `reveal-group` on the parent:

```html
<ul class="facts reveal-group">…</ul>
```

Both are ignored when the visitor has "reduce motion" turned on, and neither
can leave content permanently invisible if JavaScript fails.

---

## 10. Things that will bite you

**Curly quotes and dashes.** The site uses `&rsquo;` `&mdash;` `&middot;`
`&ndash;` rather than typing `'` and `-`. Keep doing that and the typography
stays even.

**Accented titles.** `L'Enfant et les Sortilèges`, `Die Zauberflöte`,
`Cendrillon` — the files are UTF-8, so type the accents directly. If you see
`ä½ å¥½` anywhere, your editor saved as something other than UTF-8.

**Image filenames.** Lower-case, hyphens, no spaces, no Chinese characters.
Some web servers are case-sensitive, so `Photo.JPG` and `photo.jpg` are two
different files — a link that works on your laptop can 404 once published.

**Don't upload camera originals.** Camera JPEGs run 3000–7000px on the long
edge and several megabytes each. Everything in `assets/images/` is a resized
copy at 1000–2800px and well under 300 KB. A visitor on a phone will not wait
for the originals — and the originals should never even reach this folder;
keep them wherever you keep source photos, outside the published site.

**The header is in eight files.** Change the nav in one place and seven pages
will quietly disagree. Search across all files for the thing you're changing.
