/* ==========================================================
   GET FADES — main.js
   UI logic: nav, mobile menu, barbers/gallery rendering,
   lightbox, footer year.
   Kailangan ng data.js (window.GETFADES_DATA) na naka-load muna.
   ========================================================== */

(function () {
  "use strict";

  var DATA = window.GETFADES_DATA || null;

  /* ---------- Helpers ---------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function safe(name, fn) {
    try { fn(); } catch (err) { console.error("[GET FADES] " + name + " failed:", err); }
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- Nav: solid background after scroll ---------- */
  function initNavScroll() {
    var nav = $("#nav");
    if (!nav) return;

    function update() {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var nav = $("#nav");
    var toggle = $("#nav-toggle");
    var menu = $("#nav-menu");
    if (!nav || !toggle || !menu) return;

    var mq = window.matchMedia("(max-width: 860px)");

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    function isOpen() {
      return nav.classList.contains("is-open");
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // Isara kapag may pinindot na link sa menu
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a") && isOpen()) setOpen(false);
    });

    // Isara gamit ang Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Isara kapag lumaki na ang screen (desktop layout)
    function onBreakpoint(e) {
      if (!e.matches && isOpen()) setOpen(false);
    }
    if (mq.addEventListener) mq.addEventListener("change", onBreakpoint);
    else if (mq.addListener) mq.addListener(onBreakpoint);
  }

  /* ---------- Show/hide sections na nakadepende sa data ---------- */
  function toggleDataSection(key, hasItems) {
    var section = $('[data-section="' + key + '"]');
    if (section) section.hidden = !hasItems;
    $$('[data-requires="' + key + '"]').forEach(function (link) {
      link.hidden = !hasItems;
    });
  }

  /* ---------- Barbers ---------- */
  function renderBarbers() {
    var grid = $("#barbers-grid");
    var list = DATA && Array.isArray(DATA.barbers) ? DATA.barbers : [];
    var valid = list.filter(function (b) { return b && b.name; });

    toggleDataSection("barbers", valid.length > 0);
    if (!grid || !valid.length) return;

    grid.textContent = "";
    valid.forEach(function (barber, index) {
      var card = el("article", "barber");
      card.setAttribute("data-stagger", "");

      var photo = el("div", "barber__photo");
      if (barber.photo) {
        var img = el("img");
        img.src = barber.photo;
        img.alt = barber.name + (barber.specialty ? ", " + barber.specialty : "") + " at GET FADES";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 800;
        img.height = 1067;
        img.draggable = false;
        photo.appendChild(img);
      }

      var shade = el("span", "barber__shade");
      shade.setAttribute("aria-hidden", "true");
      photo.appendChild(shade);

      var num = el("span", "barber__num", pad(index + 1));
      num.setAttribute("aria-hidden", "true");
      photo.appendChild(num);

      var info = el("div", "barber__info");
      info.appendChild(el("h3", "barber__name", barber.name));
      if (barber.specialty) info.appendChild(el("p", "barber__specialty", barber.specialty));
      if (barber.bio) info.appendChild(el("p", "barber__bio", barber.bio));
      photo.appendChild(info);

      card.appendChild(photo);
      grid.appendChild(card);
    });

    setupBarbersSlider(grid);
  }

  /* ---------- Barbers slider (swipe, drag, arrows, progress) ---------- */
  function setupBarbersSlider(track) {
    if (!track || !track.parentNode) return;
    if (track.parentNode.classList.contains("barbers-slider")) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wrapper sa paligid ng #barbers-grid
    var wrapper = el("div", "barbers-slider");
    track.parentNode.insertBefore(wrapper, track);
    wrapper.appendChild(track);

    track.setAttribute("tabindex", "0");
    track.setAttribute("role", "group");
    track.setAttribute("aria-roledescription", "carousel");
    track.setAttribute("aria-label", "GET FADES barbers");

    // Controls: progress bar + arrows
    var controls = el("div", "barbers-slider__controls");

    var progress = el("div", "barbers-slider__progress");
    progress.setAttribute("aria-hidden", "true");
    var bar = el("span", "barbers-slider__bar");
    progress.appendChild(bar);

    var arrows = el("div", "barbers-slider__arrows");
    var prev = el("button", "barbers-slider__arrow", "\u2039");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous barbers");
    var next = el("button", "barbers-slider__arrow", "\u203A");
    next.type = "button";
    next.setAttribute("aria-label", "Next barbers");
    arrows.appendChild(prev);
    arrows.appendChild(next);

    controls.appendChild(progress);
    controls.appendChild(arrows);
    wrapper.appendChild(controls);

    function step() {
      var first = track.firstElementChild;
      if (!first) return 0;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.offsetWidth + gap;
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var overflow = max > 2;
      controls.hidden = !overflow;
      if (!overflow) return;

      var ratio = track.clientWidth / track.scrollWidth;
      var pos = Math.min(1, Math.max(0, track.scrollLeft / max));
      bar.style.width = (ratio * 100) + "%";
      bar.style.transform = "translateX(" + (pos * (1 / ratio - 1) * 100) + "%)";

      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    }

    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });

    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(update);
    }, { passive: true });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    });

    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    if (window.ResizeObserver) new ResizeObserver(update).observe(track);

    // Drag gamit ang mouse (swipe sa touch ay native na)
    var dragging = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) track.classList.add("is-dragging");
      track.scrollLeft = startScroll - dx;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
    }
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    update();
  }

  /* ---------- Gallery + lightbox ---------- */
  var galleryItems = [];

  function renderGallery() {
    var grid = $("#gallery-grid");
    var list = DATA && Array.isArray(DATA.gallery) ? DATA.gallery : [];
    galleryItems = list.filter(function (item) { return item && item.src; });

    toggleDataSection("gallery", galleryItems.length > 0);
    if (!grid || !galleryItems.length) return;

    grid.textContent = "";
    galleryItems.forEach(function (item, index) {
      var button = el("button", "gallery__item");
      button.type = "button";
      button.setAttribute("data-stagger", "");
      button.setAttribute("data-index", String(index));
      button.setAttribute("aria-label", "View larger: " + (item.alt || "haircut " + (index + 1)));

      var media;
      if (item.type === "video") {
        media = el("video");
        media.muted = true;
        media.playsInline = true;
        media.preload = "metadata";
        media.setAttribute("aria-hidden", "true");
        if (item.poster) media.poster = item.poster;
        media.src = item.src;
      } else {
        media = el("img");
        media.src = item.src;
        media.alt = item.alt || "";
        media.loading = "lazy";
        media.decoding = "async";
      }
      if (item.width) media.setAttribute("width", item.width);
      if (item.height) media.setAttribute("height", item.height);

      button.appendChild(media);
      grid.appendChild(button);
    });

    grid.addEventListener("click", function (e) {
      var target = e.target.closest(".gallery__item");
      if (target) openLightbox(Number(target.getAttribute("data-index")), target);
    });
  }

  var lightbox, stage, btnClose, btnPrev, btnNext;
  var currentIndex = 0;
  var lastFocused = null;
  var touchStartX = null;

  function showSlide(index) {
    if (!galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];

    stage.textContent = "";
    var media;
    if (item.type === "video") {
      media = el("video");
      media.controls = true;
      media.playsInline = true;
      media.preload = "metadata";
      if (item.poster) media.poster = item.poster;
      media.src = item.src;
      media.setAttribute("aria-label", item.alt || "GET FADES video");
    } else {
      media = el("img");
      media.src = item.src;
      media.alt = item.alt || "";
    }
    stage.appendChild(media);

    var multiple = galleryItems.length > 1;
    btnPrev.hidden = !multiple;
    btnNext.hidden = !multiple;
  }

  function openLightbox(index, trigger) {
    lastFocused = trigger || document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    showSlide(index);
    btnClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    var video = $("video", stage);
    if (video) video.pause();
    stage.textContent = "";
    lightbox.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function initLightbox() {
    lightbox = $("#lightbox");
    stage = $("#lightbox-stage");
    btnClose = $("#lightbox-close");
    btnPrev = $("#lightbox-prev");
    btnNext = $("#lightbox-next");
    if (!lightbox || !stage || !btnClose || !btnPrev || !btnNext) return;

    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", function () { showSlide(currentIndex - 1); });
    btnNext.addEventListener("click", function () { showSlide(currentIndex + 1); });

    // Click sa madilim na background para isara
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === stage) closeLightbox();
    });

    // Keyboard: Esc, arrows, at focus trap
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;

      if (e.key === "Escape") { closeLightbox(); return; }
      if (e.key === "ArrowLeft") { showSlide(currentIndex - 1); return; }
      if (e.key === "ArrowRight") { showSlide(currentIndex + 1); return; }

      if (e.key === "Tab") {
        var focusable = [btnClose, btnPrev, btnNext].filter(function (b) { return !b.hidden; });
        var vid = $("video", stage);
        if (vid) focusable.push(vid);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Swipe sa mobile
    lightbox.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) < 50) return;
      showSlide(currentIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- Init ---------- */
  function init() {
    if (!DATA) {
      console.warn("[GET FADES] data.js did not load. Static content is still visible.");
    }
    safe("year", initYear);
    safe("navScroll", initNavScroll);
    safe("mobileMenu", initMobileMenu);
    safe("barbers", renderBarbers);
    safe("lightbox", initLightbox);
    safe("gallery", renderGallery);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();