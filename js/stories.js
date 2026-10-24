/* ==========================================================
   GET FADES — stories.js
   Instagram Stories-style gallery. Kinukuha ang listahan sa
   window.GETFADES_DATA.stories (data.js). Hindi ginagalaw ang
   photo marquee at video marquee.
   ========================================================== */

(function () {
  "use strict";

  var DURATION = 4500; // ms bawat photo
  var DATA = window.GETFADES_DATA || null;
  var groups = DATA && Array.isArray(DATA.stories)
    ? DATA.stories.filter(function (g) { return g && g.name && g.photos && g.photos.length; })
    : [];
  if (!groups.length) return;

  var gallery = document.getElementById("gallery");
  var head = gallery && gallery.querySelector(".section-head");
  if (!head) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Hilera ng bilog ---------- */
  var row = el("div", "stories");
  row.appendChild(el("p", "stories__hint", "Tap a cut to view it"));
  var list = el("div", "stories__list");
  row.appendChild(list);

  var items = groups.map(function (g, i) {
    var btn = el("button", "stories__item");
    btn.type = "button";
    btn.setAttribute("aria-label", "View " + g.name + " (" + g.photos.length + " photos)");

    var ring = el("span", "stories__ring");
    var img = el("img");
    img.src = g.cover || g.photos[0];
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    ring.appendChild(img);

    btn.appendChild(ring);
    btn.appendChild(el("span", "stories__name", g.name));
    btn.addEventListener("click", function () { open(i, 0, btn); });
    list.appendChild(btn);
    return btn;
  });

  head.parentNode.insertBefore(row, head.nextSibling);

  /* ---------- Viewer ---------- */
  var viewer = el("div", "story");
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", "Haircut stories");
  viewer.hidden = true;

  var frame = el("div", "story__frame");
  var media = el("img", "story__media");
  media.alt = "";
  media.draggable = false;
  var shade = el("div", "story__shade");
  shade.setAttribute("aria-hidden", "true");
  var bars = el("div", "story__bars");
  bars.setAttribute("aria-hidden", "true");

  var headRow = el("div", "story__head");
  var titleWrap = el("div");
  var title = el("p", "story__title");
  var count = el("p", "story__count");
  titleWrap.appendChild(title);
  titleWrap.appendChild(count);
  var closeBtn = el("button", "story__close", "\u00D7");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  headRow.appendChild(titleWrap);
  headRow.appendChild(closeBtn);

  var tap = el("div", "story__tap");
  var cta = el("a", "btn btn--light story__cta", "Book this cut");
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  var fb = DATA && DATA.business && DATA.business.social && DATA.business.social.facebook;
  if (fb) cta.href = fb; else cta.hidden = true;

  frame.appendChild(media);
  frame.appendChild(shade);
  frame.appendChild(bars);
  frame.appendChild(headRow);
  frame.appendChild(tap);
  frame.appendChild(cta);
  viewer.appendChild(frame);
  document.body.appendChild(viewer);

  var g = 0;           // kasalukuyang group
  var p = 0;           // kasalukuyang photo
  var fills = [];
  var elapsed = 0;     // ms na tumakbo sa kasalukuyang photo
  var lastTs = 0;
  var rafId = 0;
  var paused = false;
  var lastFocused = null;

  function buildBars() {
    bars.textContent = "";
    fills = groups[g].photos.map(function () {
      var b = el("span", "story__bar");
      var f = el("span", "story__bar-fill");
      b.appendChild(f);
      bars.appendChild(b);
      return f;
    });
  }

  function paintBars() {
    fills.forEach(function (f, i) {
      f.style.width = i < p ? "100%" : i === p ? Math.min(100, (elapsed / DURATION) * 100) + "%" : "0%";
    });
  }

  function preload(src) { var i = new Image(); i.src = src; }

  function show() {
    var group = groups[g];
    media.src = group.photos[p];
    media.alt = group.name + " haircut, photo " + (p + 1);
    title.textContent = group.name;
    count.textContent = pad(p + 1) + " / " + pad(group.photos.length);
    elapsed = 0;
    lastTs = 0;
    paintBars();
    if (group.photos[p + 1]) preload(group.photos[p + 1]);
  }

  function next() {
    if (p < groups[g].photos.length - 1) { p++; show(); return; }
    if (g < groups.length - 1) { g++; p = 0; buildBars(); show(); markSeen(); return; }
    close();
  }
  function prev() {
    if (elapsed > 800 || p === 0) {
      if (p === 0 && g > 0 && elapsed <= 800) { g--; p = groups[g].photos.length - 1; buildBars(); }
      show();
      return;
    }
    p--; show();
  }

  function markSeen() { items[g].classList.add("is-seen"); }

  function loop(ts) {
    if (viewer.hidden) return;
    if (!paused) {
      if (lastTs) elapsed += Math.min(ts - lastTs, 64);
      lastTs = ts;
      paintBars();
      if (elapsed >= DURATION) { next(); }
    } else {
      lastTs = 0;
    }
    rafId = window.requestAnimationFrame(loop);
  }

  function open(gi, pi, trigger) {
    lastFocused = trigger || document.activeElement;
    g = gi; p = pi;
    viewer.hidden = false;
    document.body.classList.add("is-locked");
    paused = false;
    buildBars();
    show();
    markSeen();
    closeBtn.focus();
    window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(loop);
  }

  function close() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    window.cancelAnimationFrame(rafId);
    media.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  closeBtn.addEventListener("click", close);

  /* Tap kaliwa/kanan, hawak = pause, swipe pababa = isara */
  var downX = 0, downY = 0, downT = 0, held = false, holdTimer = 0;

  tap.addEventListener("pointerdown", function (e) {
    downX = e.clientX; downY = e.clientY; downT = Date.now(); held = false;
    holdTimer = window.setTimeout(function () { held = true; paused = true; }, 200);
    if (tap.setPointerCapture) tap.setPointerCapture(e.pointerId);
  });
  function release(e, cancelled) {
    window.clearTimeout(holdTimer);
    var dx = e.clientX - downX;
    var dy = e.clientY - downY;
    paused = false;
    if (cancelled) return;
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { close(); return; }
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); return; }
    if (held || Date.now() - downT > 400) return;
    var rect = tap.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.33) prev(); else next();
  }
  tap.addEventListener("pointerup", function (e) { release(e, false); });
  tap.addEventListener("pointercancel", function (e) { release(e, true); });

  /* Backdrop click (desktop) */
  viewer.addEventListener("click", function (e) { if (e.target === viewer) close(); });

  /* Keyboard + focus trap */
  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowRight") { next(); return; }
    if (e.key === "ArrowLeft") { prev(); return; }
    if (e.key === "Tab") {
      var f = [closeBtn];
      if (!cta.hidden) f.push(cta);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Pause kapag nag-switch ng tab */
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });
})();