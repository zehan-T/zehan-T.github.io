/* ============================================================================
   site.js — progressive enhancement only.
   ----------------------------------------------------------------------------
   Every word of content lives in the HTML. This file adds behaviour on top:
   house lights, language, sticky nav, mobile menu, scroll reveal, the photo
   lightbox, the audio players, and dimming dates that have already passed.

   If this file fails to load, the site is still complete and readable.
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_THEME = "zt.theme";
  var STORE_LANG = "zt.lang";

  /* Storage can throw in private mode / file:// on some browsers. Never let
     that take the rest of the script down with it. */
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* no-op */ }
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     1. HOUSE LIGHTS  (day / night)
     ====================================================================== */
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "night" : "day";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "night" ? "Turn the house lights up" : "Take the house lights down"
      );
    }
    /* Keep the browser UI (address bar) in step with the page. */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "night" ? "#14120F" : "#F7F3EB");
  }

  function initTheme() {
    var stored = read(STORE_THEME);
    if (stored === "day" || stored === "night") applyTheme(stored);
    else applyTheme(currentTheme());

    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = currentTheme() === "night" ? "day" : "night";
      applyTheme(next);
      write(STORE_THEME, next);
    });
  }

  /* ==========================================================================
     2. LANGUAGE  (en / zh)
     --------------------------------------------------------------------------
     Switching is done entirely by setting <html lang>. base.css hides the
     spans belonging to the other language. Nothing is fetched or re-rendered.
     ====================================================================== */
  function applyLang(lang) {
    root.setAttribute("lang", lang);
    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < buttons.length; i++) {
      var value = buttons[i].getAttribute("data-lang-btn");
      buttons[i].setAttribute("aria-pressed", value === lang ? "true" : "false");
    }
  }

  function initLang() {
    var stored = read(STORE_LANG);
    if (stored === "en" || stored === "zh") {
      applyLang(stored);
    } else {
      /* Meet Chinese-speaking visitors in Chinese on their first visit. */
      var pref = (navigator.language || "en").toLowerCase();
      applyLang(pref.indexOf("zh") === 0 ? "zh" : "en");
    }

    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var lang = this.getAttribute("data-lang-btn");
        applyLang(lang);
        write(STORE_LANG, lang);
      });
    }
  }

  /* ==========================================================================
     3. STICKY HEADER
     ====================================================================== */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 24);
      ticking = false;
    }
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ==========================================================================
     4. MOBILE NAVIGATION
     ====================================================================== */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    /* Tapping a link, pressing Escape, or growing past the mobile breakpoint
       should all put the drawer away. */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000) setOpen(false);
    });
  }

  /* ==========================================================================
     5. SCROLL REVEAL
     ====================================================================== */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    /* Stagger any .reveal-group children via the --i custom property. */
    var groups = document.querySelectorAll(".reveal-group");
    for (var g = 0; g < groups.length; g++) {
      var kids = groups[g].children;
      for (var k = 0; k < kids.length; k++) {
        kids[k].style.setProperty("--i", k);
      }
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var n = 0; n < items.length; n++) items[n].classList.add("is-visible");
      return;
    }

    /* threshold 0, deliberately: some revealed blocks (the performance
       history, the gallery grid) are several screens tall, and a percentage
       threshold can be hard or impossible for them to reach on a short
       viewport — which left them permanently invisible. Any intersection at
       all is the right trigger; rootMargin still holds the reveal back until
       the block is properly inside the viewport. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

    for (var i = 0; i < items.length; i++) io.observe(items[i]);
  }

  /* ==========================================================================
     6. LIGHTBOX
     --------------------------------------------------------------------------
     Driven by the gallery markup: every <button class="photo"> carries
     data-full and data-caption. Arrow keys and the on-screen chevrons move
     through the set; Escape closes and focus returns to where it started.
     ====================================================================== */
  function initLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".photo[data-full]"));
    var box = document.getElementById("lightbox");
    if (!triggers.length || !box) return;

    var imgEl = box.querySelector(".lightbox__img");
    var capEl = box.querySelector(".lightbox__text");
    var countEl = box.querySelector(".lightbox__count");
    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      var t = triggers[index];
      imgEl.src = t.getAttribute("data-full");
      imgEl.alt = t.getAttribute("data-caption") || "";
      capEl.textContent = t.getAttribute("data-caption") || "";
      countEl.textContent = (index + 1) + " / " + triggers.length;

      /* Warm the neighbours so arrowing through feels instant. */
      [index + 1, index - 1].forEach(function (j) {
        var n = triggers[(j + triggers.length) % triggers.length];
        var pre = new Image();
        pre.src = n.getAttribute("data-full");
      });
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      var close = box.querySelector(".lightbox__close");
      if (close) close.focus();
    }

    function close() {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach(function (t, i) {
      t.addEventListener("click", function () { open(i); });
    });

    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { show(index - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { show(index + 1); });

    /* Clicking the scrim (but not the photo itself) closes. */
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.classList.contains("lightbox__figure")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
    });
  }

  /* ==========================================================================
     7. AUDIO PLAYERS
     --------------------------------------------------------------------------
     Each .track holds an <audio> and an empty .wave. We fill the wave with
     bars whose heights come from a seeded pattern — it is a progress bar
     dressed as a waveform, not real audio analysis, and it is honest about
     that. Clicking anywhere on the wave seeks.
     ====================================================================== */
  var BARS = 64;

  function barHeights(seed) {
    /* A tiny deterministic generator, so a given track always looks the same
       across reloads and browsers. */
    var out = [];
    var x = seed || 1;
    for (var i = 0; i < BARS; i++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      var noise = (x / 0x7fffffff);
      /* Shape it like a sung phrase: swell in, taper out. */
      var envelope = Math.sin((i / (BARS - 1)) * Math.PI);
      out.push(0.18 + (0.28 * noise + 0.54 * envelope * (0.55 + 0.45 * noise)) * 0.82);
    }
    return out;
  }

  function fmt(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function initTracks() {
    var tracks = document.querySelectorAll(".track");
    if (!tracks.length) return;

    var all = [];

    Array.prototype.forEach.call(tracks, function (track, ti) {
      var audio = track.querySelector("audio");
      var wave = track.querySelector(".wave");
      var playBtn = track.querySelector(".track__play");
      var timeEl = track.querySelector(".track__time");
      if (!audio || !wave || !playBtn) return;

      all.push(audio);

      /* --- build the bars --- */
      var heights = barHeights(ti * 7919 + 13);
      var bars = [];
      for (var i = 0; i < BARS; i++) {
        var bar = document.createElement("span");
        bar.className = "wave__bar";
        bar.style.height = (heights[i] * 100).toFixed(1) + "%";
        wave.appendChild(bar);
        bars.push(bar);
      }

      function paint(ratio) {
        var upTo = Math.round(ratio * BARS);
        for (var i = 0; i < BARS; i++) {
          bars[i].classList.toggle("is-played", i < upTo);
        }
      }

      function tick() {
        var d = audio.duration;
        paint(d ? audio.currentTime / d : 0);
        if (timeEl) {
          timeEl.textContent = fmt(audio.currentTime) +
            (d && isFinite(d) ? " / " + fmt(d) : "");
        }
      }

      playBtn.addEventListener("click", function () {
        if (audio.paused) {
          /* Only one thing sings at a time. */
          all.forEach(function (a) { if (a !== audio) a.pause(); });
          audio.play().catch(function () {
            /* File missing or the browser refused. Say so rather than
               leaving a dead button. */
            track.classList.add("is-error");
            if (timeEl) timeEl.textContent = "unavailable";
          });
        } else {
          audio.pause();
        }
      });

      audio.addEventListener("play", function () { track.classList.add("is-playing"); });
      audio.addEventListener("pause", function () { track.classList.remove("is-playing"); });
      audio.addEventListener("ended", function () {
        track.classList.remove("is-playing");
        paint(0);
        if (timeEl) timeEl.textContent = fmt(0) + " / " + fmt(audio.duration);
      });
      audio.addEventListener("timeupdate", tick);
      audio.addEventListener("loadedmetadata", tick);

      /* Seeking: translate the click position into a time. */
      wave.addEventListener("click", function (e) {
        var box = wave.getBoundingClientRect();
        var ratio = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
        if (audio.duration) {
          audio.currentTime = ratio * audio.duration;
          paint(ratio);
        }
      });

      paint(0);
      if (timeEl) timeEl.textContent = "0:00";
    });
  }

  /* ==========================================================================
     7b. VIDEO — facade to inline player
     --------------------------------------------------------------------------
     Each video ships as a still frame with our own play button. On the first
     click we replace it with the real embed, already playing. Two details
     matter for "plays here, not on YouTube":

       playsinline=1  stops iOS Safari from hijacking it into the fullscreen
                      native player
       youtube-nocookie.com  serves the same embed without setting tracking
                      cookies until playback starts

     YouTube still draws its own title bar and a "Watch on YouTube" button
     inside the player — that is required by their terms and cannot be turned
     off. Playback itself never leaves this page.
     ====================================================================== */
  function initVideos() {
    var facades = document.querySelectorAll(".video-facade[data-video]");
    if (!facades.length) return;

    Array.prototype.forEach.call(facades, function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-video");
        if (!id) return;

        var frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
                    "?autoplay=1&playsinline=1&rel=0&modestbranding=1";
        frame.title = btn.getAttribute("data-title") || "Video";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; " +
                      "gyroscope; picture-in-picture; web-share";
        frame.setAttribute("allowfullscreen", "");
        frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        frame.setAttribute("loading", "eager");

        btn.parentNode.replaceChild(frame, btn);
      });
    });
  }

  /* ==========================================================================
     8. PAST DATES
     --------------------------------------------------------------------------
     Add data-date="YYYY-MM-DD" to a .date-row and it dims itself once the
     day has gone by — so the calendar ages correctly with no edits.
     ====================================================================== */
  function initDates() {
    var rows = document.querySelectorAll(".date-row[data-date]");
    if (!rows.length) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    Array.prototype.forEach.call(rows, function (row) {
      var raw = row.getAttribute("data-date");
      var parts = raw.split("-");
      if (parts.length < 3) return;
      var when = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (when < today) row.classList.add("is-past");
    });
  }

  /* ==========================================================================
     9. CONTACT FORM
     --------------------------------------------------------------------------
     A static host cannot receive a form post, so by default we hand the
     message to the visitor's own mail app. The moment the form is pointed at
     a real endpoint (Formspree, Netlify Forms, ...) the data-mailto attribute
     comes off and this handler steps out of the way.
     ====================================================================== */
  function initForm() {
    var forms = document.querySelectorAll("form[data-mailto]");
    if (!forms.length) return;

    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var to = form.getAttribute("data-mailto");
        var get = function (name) {
          var el = form.elements[name];
          return el ? el.value.trim() : "";
        };

        var subject = get("subject") || "Website enquiry";
        var body =
          "From: " + get("name") + "\n" +
          "Email: " + get("email") + "\n\n" +
          get("message");

        window.location.href = "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
      });
    });
  }

  /* ==========================================================================
     10. SMALL CHORES
     ====================================================================== */
  function initChores() {
    /* Copyright year, so the footer never goes stale. */
    var years = document.querySelectorAll("[data-year]");
    var now = String(new Date().getFullYear());
    Array.prototype.forEach.call(years, function (el) { el.textContent = now; });
  }

  /* ==========================================================================
     BOOT
     ====================================================================== */
  function boot() {
    root.classList.remove("no-js");
    initTheme();
    initLang();
    initHeader();
    initNav();
    initReveal();
    initLightbox();
    initTracks();
    initVideos();
    initDates();
    initForm();
    initChores();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
