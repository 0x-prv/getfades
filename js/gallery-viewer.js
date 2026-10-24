/* ==========================================================
   GET FADES — gallery-viewer.js (v2: Instagram-stories look)
   Pindutin ang photo/video sa marquee: bubukas ang viewer na may
   malaking card sa gitna at maliliit na preview sa gilid.
   Slide: arrows, swipe, keyboard, o pindutin ang preview.
   Hindi ginagalaw ang marquee scripts.
   ========================================================== */

(function () {
  "use strict";

  var photoMarquee = document.getElementById("gallery-marquee");
  var videoMarquee = document.getElementById("video-marquee");
  if (!photoMarquee && !videoMarquee) return;

  var DATA = window.GETFADES_DATA || null;
  var fbUrl = DATA && DATA.business && DATA.business.social && DATA.business.social.facebook;
  var LOGO = "public/images/shop/logo.png";

  var SIDE_SCALE = 0.4;   // laki ng preview kumpara sa gitna
  var SIDE_GAP = 60;      // px sa pagitan ng gitna at preview
  var wideMq = window.matchMedia("(min-width: 900px)");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function slice(list) { return Array.prototype.slice.call(list); }

  var ICON = {
    soundOff: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>'
  };

  /* Listahan: lahat ng photo muna, tapos lahat ng video (galing sa unang group, hindi sa kopya) */
  function getItems() {
    var out = [];
    var pg = photoMarquee && photoMarquee.querySelector(".gallery-marquee__group");
    if (pg) {
      slice(pg.querySelectorAll("img")).forEach(function (img) {
        out.push({ type: "image", src: img.getAttribute("src"), alt: img.getAttribute("alt") || "GET FADES haircut" });
      });
    }
    var vg = videoMarquee && videoMarquee.querySelector(".video-marquee__group");
    if (vg) {
      slice(vg.querySelectorAll("video")).forEach(function (v) {
        out.push({ type: "video", src: v.getAttribute("src"), alt: "GET FADES haircut video" });
      });
    }
    return out;
  }

  /* ---------- DOM ---------- */
  var viewer = el("div", "gv");
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", "Gallery viewer");
  viewer.hidden = true;

  var stage = el("div", "gv__stage");

  var chrome = el("div", "gv__chrome");
  var bar = el("div", "gv__bar");
  bar.setAttribute("aria-hidden", "true");
  var barFill = el("span", "gv__bar-fill");
  bar.appendChild(barFill);

  var head = el("div", "gv__head");
  var avatar = el("img", "gv__avatar");
  avatar.src = LOGO;
  avatar.alt = "";
  var who = el("div", "gv__who");
  var nameEl = el("div", "gv__name", "GET FADES");
  var subEl = el("div", "gv__sub");
  who.appendChild(nameEl);
  who.appendChild(subEl);

  var tools = el("div", "gv__tools");
  var muteBtn = el("button", "gv__tool");
  muteBtn.type = "button";
  muteBtn.innerHTML = '<span class="gv__ico-main">' + ICON.soundOff + '</span><span class="gv__ico-alt">' + ICON.soundOn + "</span>";
  var playBtn = el("button", "gv__tool");
  playBtn.type = "button";
  playBtn.innerHTML = '<span class="gv__ico-main">' + ICON.pause + '</span><span class="gv__ico-alt">' + ICON.play + "</span>";
  tools.appendChild(muteBtn);
  tools.appendChild(playBtn);

  head.appendChild(avatar);
  head.appendChild(who);
  head.appendChild(tools);

  var cta = el("a", "btn btn--light gv__cta", "Book an appointment");
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  if (fbUrl) cta.href = fbUrl; else cta.hidden = true;

  chrome.appendChild(bar);
  chrome.appendChild(head);
  chrome.appendChild(cta);

  var closeBtn = el("button", "gv__btn gv__close", "\u00D7");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  var prevBtn = el("button", "gv__btn gv__arrow gv__prev", "\u2039");
  prevBtn.type = "button";
  prevBtn.setAttribute("aria-label", "Previous");
  var nextBtn = el("button", "gv__btn gv__arrow gv__next", "\u203A");
  nextBtn.type = "button";
  nextBtn.setAttribute("aria-label", "Next");

  [stage, chrome, prevBtn, nextBtn, closeBtn].forEach(function (n) { viewer.appendChild(n); });
  document.body.appendChild(viewer);

  /* ---------- State ---------- */
  var items = [];
  var slides = [];
  var current = 0;
  var muted = true;
  var lastFocused = null;

  function activeVideo() {
    var v = slides[current] && slides[current].querySelector("video");
    return v || null;
  }

  function ensureMedia(i) {
    var sl = slides[i];
    if (!sl || sl.getAttribute("data-ready")) return;
    sl.setAttribute("data-ready", "1");
    var item = items[i];
    if (item.type === "video") {
      var v = el("video", "gv__media");
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "metadata";
      v.disablePictureInPicture = true;
      v.src = item.src + "#t=0.1";
      v.setAttribute("aria-label", item.alt);
      v.addEventListener("timeupdate", function () {
        if (i !== current || !v.duration) return;
        barFill.style.width = (v.currentTime / v.duration) * 100 + "%";
      });
      sl.appendChild(v);
    } else {
      var bg = el("div", "gv__bg");
      bg.style.backgroundImage = 'url("' + item.src + '")';
      bg.setAttribute("aria-hidden", "true");
      var img = el("img", "gv__media");
      img.src = item.src;
      img.alt = item.alt;
      img.draggable = false;
      sl.appendChild(bg);
      sl.appendChild(img);
    }
  }

  /* Posisyon ng bawat card: gitna, o preview sa kaliwa/kanan */
  function layout() {
    var wide = wideMq.matches;
    var W = chrome.offsetWidth || 360;
    var nw = W * SIDE_SCALE;
    slides.forEach(function (sl, i) {
      var o = i - current;
      var a = Math.abs(o);
      var x = 0, sc = 1, op = 1;
      if (o !== 0) {
        if (!wide || a > 2) {
          op = 0;
          x = (o > 0 ? 1 : -1) * (W + SIDE_GAP);
        } else {
          x = (o > 0 ? 1 : -1) * (W / 2 + SIDE_GAP + nw / 2 + (a - 1) * (nw + SIDE_GAP * 0.4));
          sc = SIDE_SCALE;
        }
      }
      sl.style.transform = "translate3d(" + x + "px,0,0) scale(" + sc + ")";
      sl.style.opacity = op;
      sl.style.zIndex = String(10 - a);
      sl.style.pointerEvents = op ? "auto" : "none";
      sl.classList.toggle("is-side", o !== 0 && op > 0);
      sl.setAttribute("aria-hidden", o === 0 ? "false" : "true");
      if (a <= 2) ensureMedia(i);
    });
  }

  function syncVideos() {
    slides.forEach(function (sl, i) {
      var v = sl.querySelector("video");
      if (!v) return;
      if (i === current) {
        v.muted = muted;
        var p = v.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      } else {
        v.pause();
        v.muted = true;
      }
    });
    playBtn.classList.remove("is-on");
    muteBtn.classList.toggle("is-on", !muted);
    muteBtn.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
    playBtn.setAttribute("aria-label", "Pause");
    barFill.style.width = "0%";
  }

  function updateChrome() {
    var item = items[current];
    chrome.classList.toggle("is-video", item.type === "video");
    subEl.textContent = (item.type === "video" ? "Video" : "Photo") + " " + pad(current + 1) + " / " + pad(items.length);
    prevBtn.hidden = current <= 0;
    nextBtn.hidden = current >= items.length - 1;
  }

  function go(to) {
    to = Math.max(0, Math.min(items.length - 1, to));
    if (to === current) return;
    current = to;
    layout();
    updateChrome();
    syncVideos();
  }

  function open(index, trigger) {
    items = getItems();
    if (!items.length) return;
    lastFocused = trigger || document.activeElement;

    stage.textContent = "";
    slides = items.map(function (item, i) {
      var sl = el("div", "gv__slide");
      sl.setAttribute("data-index", String(i));
      stage.appendChild(sl);
      return sl;
    });

    current = Math.max(0, Math.min(items.length - 1, index));
    viewer.hidden = false;
    viewer.classList.add("no-anim"); // walang animation sa unang labas
    document.body.classList.add("is-locked");
    layout();
    updateChrome();
    syncVideos();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { viewer.classList.remove("no-anim"); });
    });
    closeBtn.focus();
  }

  function close() {
    if (viewer.hidden) return;
    slides.forEach(function (sl) {
      var v = sl.querySelector("video");
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    });
    stage.textContent = "";
    slides = [];
    viewer.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  /* ---------- Controls ---------- */
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () { go(current - 1); });
  nextBtn.addEventListener("click", function () { go(current + 1); });

  muteBtn.addEventListener("click", function () {
    muted = !muted;
    var v = activeVideo();
    if (v) v.muted = muted;
    muteBtn.classList.toggle("is-on", !muted);
    muteBtn.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
  });

  function togglePlay() {
    var v = activeVideo();
    if (!v) return;
    if (v.paused) {
      var p = v.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
      playBtn.classList.remove("is-on");
      playBtn.setAttribute("aria-label", "Pause");
    } else {
      v.pause();
      playBtn.classList.add("is-on");
      playBtn.setAttribute("aria-label", "Play");
    }
  }
  playBtn.addEventListener("click", togglePlay);

  /* Click: preview = lipat doon, gitna na video = play/pause, labas = isara */
  var moved = false;
  stage.addEventListener("click", function (e) {
    if (moved) { moved = false; return; }
    var sl = e.target.closest(".gv__slide");
    if (!sl) { close(); return; }
    var i = Number(sl.getAttribute("data-index"));
    if (i !== current) go(i);
    else togglePlay();
  });

  /* Keyboard + focus trap */
  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowLeft") { go(current - 1); return; }
    if (e.key === "ArrowRight") { go(current + 1); return; }
    if (e.key === " " && items[current] && items[current].type === "video" && document.activeElement === closeBtn) {
      e.preventDefault(); togglePlay(); return;
    }
    if (e.key === "Tab") {
      var f = [closeBtn, prevBtn, nextBtn, muteBtn, playBtn, cta].filter(function (b) {
        return b && !b.hidden && b.offsetParent !== null;
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Swipe kaliwa/kanan = slide, swipe pababa = isara */
  var sx = 0, sy = 0, tracking = false;
  viewer.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button, a")) return;
    tracking = true; moved = false; sx = e.clientX; sy = e.clientY;
  });
  viewer.addEventListener("pointerup", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) moved = true;
    if (dy > 100 && Math.abs(dy) > Math.abs(dx)) { close(); return; }
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(current + (dx < 0 ? 1 : -1));
    }
  });
  viewer.addEventListener("pointercancel", function () { tracking = false; });

  window.addEventListener("resize", function () {
    if (viewer.hidden) return;
    viewer.classList.add("no-anim");
    layout();
    window.requestAnimationFrame(function () { viewer.classList.remove("no-anim"); });
  });

  /* ---------- Photo marquee: tap lang (hindi drag) ---------- */
  if (photoMarquee) {
    var down = null;
    // capture:true para mauna sa drag script ng marquee
    photoMarquee.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      var item = e.target.closest(".gallery-marquee__item");
      down = item ? { x: e.clientX, y: e.clientY, t: Date.now(), item: item } : null;
    }, true);
    photoMarquee.addEventListener("pointerup", function (e) {
      if (!down) return;
      var d = down;
      down = null;
      var travel = Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y);
      if (travel > 8 || Date.now() - d.t > 600) return; // drag, hindi tap
      var pos = slice(d.item.parentNode.children).indexOf(d.item);
      if (pos >= 0) open(pos, d.item);
    });
    photoMarquee.addEventListener("pointercancel", function () { down = null; });
  }

  /* ---------- Video marquee ---------- */
  if (videoMarquee) {
    videoMarquee.addEventListener("click", function (e) {
      var item = e.target.closest(".video-marquee__item");
      if (!item) return;
      var pos = slice(item.parentNode.children).indexOf(item);
      if (pos < 0) return;
      var pg = photoMarquee && photoMarquee.querySelector(".gallery-marquee__group");
      var photoCount = pg ? pg.querySelectorAll("img").length : 0;
      open(photoCount + pos, item);
    });
  }
})();