/* ==========================================================
   GET FADES — franchise.js (v2: kinetic "Coming soon")
   1) Text ng section galing sa data.js (GETFADES_DATA.franchise):
      open: false = Coming soon, open: true = Now open.
   2) Gumagalaw na malalaking hilera. Bumibilis at nagtitilt
      habang nag-i-scroll. Hindi gumagalaw kapag wala sa screen
      o kapag naka-reduce-motion.
   ========================================================== */

(function () {
  "use strict";

  var DATA = window.GETFADES_DATA || null;
  var f = DATA && DATA.franchise;
  var section = document.getElementById("franchise");
  if (!section) return;

  var LOGO = "public/images/shop/logo.png";

  function set(name, value) {
    var node = section.querySelector('[data-franchise="' + name + '"]');
    if (node && value) node.textContent = value;
  }

  /* ---------- Text galing sa data.js ---------- */
  var isOpen = !!(f && f.open);
  var state = f ? (isOpen ? f.opened : f.comingSoon) : null;

  if (f) set("badge", isOpen ? "Now open" : "Coming soon");
  if (state) {
    set("title", state.title);
    set("text", state.text);
    set("button", state.button);
    var btn = section.querySelector('[data-franchise="button"]');
    var fb = DATA.business && DATA.business.social && DATA.business.social.facebook;
    var url = (isOpen && state.url) || fb;
    if (btn && url) btn.href = url;
    // Walang button kapag walang nakasulat na button text (Coming soon)
    if (btn) btn.hidden = !state.button;
  }

  /* ---------- Hilera ---------- */
  var stack = document.getElementById("fr-stack");
  var rows = Array.prototype.slice.call(section.querySelectorAll(".fr-row"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var objs = rows.map(function (row) {
    var track = row.querySelector(".fr-track");
    var group = row.querySelector(".fr-group");
    var existing = group.querySelector(".fr-word");
    var word = f ? (isOpen ? "Now open" : "Coming soon") : (existing ? existing.textContent : "Coming soon");

    // Ulitin ang salita 3x kasama ang logo, tapos kopyahin para tuloy-tuloy ang loop
    group.textContent = "";
    for (var i = 0; i < 3; i++) {
      var span = document.createElement("span");
      span.className = "fr-word";
      span.textContent = word;
      group.appendChild(span);
      var img = document.createElement("img");
      img.className = "fr-sep";
      img.src = LOGO;
      img.alt = "";
      img.draggable = false;
      group.appendChild(img);
    }
    var copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);

    return {
      track: track,
      group: group,
      dir: Number(row.getAttribute("data-dir")) || -1,   // -1 = pakaliwa, 1 = pakanan
      speed: Number(row.getAttribute("data-speed")) || 70, // px bawat segundo
      x: 0,
      w: 0,
      placed: false
    };
  });

  function wrap(o) {
    if (!o.w) return;
    while (o.x <= -o.w) o.x += o.w;
    while (o.x > 0) o.x -= o.w;
  }
  function render(o) {
    o.track.style.transform = "translate3d(" + o.x + "px,0,0)";
  }
  function measure() {
    objs.forEach(function (o) {
      o.w = o.group.getBoundingClientRect().width;
      if (!o.placed && o.w) {
        o.x = o.dir > 0 ? -o.w / 2 : 0;
        o.placed = true;
      }
      wrap(o);
      render(o);
    });
  }

  measure();
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (window.ResizeObserver) {
    objs.forEach(function (o) { new ResizeObserver(measure).observe(o.group); });
  }

  /* ---------- Reveal pagpasok sa screen ---------- */
  if (reduce || !("IntersectionObserver" in window)) {
    section.classList.add("is-in");
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.classList.add("is-in");
        revealIO.disconnect();
      }
    }, { threshold: 0.15 });
    revealIO.observe(section);
  }

  if (reduce) return; // static lang kapag reduce-motion

  /* ---------- Galaw: base speed + boost habang nag-i-scroll ---------- */
  var visible = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(section);
  } else {
    visible = true;
  }

  var lastTs = 0;
  var lastY = window.scrollY;
  var vel = 0;      // smoothed scroll velocity (px/s)
  var skew = 0;     // smoothed tilt (deg)

  function tick(ts) {
    var dt = lastTs ? Math.min(ts - lastTs, 64) : 16;
    lastTs = ts;

    var y = window.scrollY;
    var inst = dt ? ((y - lastY) / dt) * 1000 : 0;
    lastY = y;
    vel += (inst - vel) * 0.12;

    if (visible) {
      var boost = 1 + Math.min(Math.abs(vel) / 500, 3);
      objs.forEach(function (o) {
        o.x += o.dir * o.speed * boost * (dt / 1000);
        wrap(o);
        render(o);
      });

      var targetSkew = Math.max(-7, Math.min(7, -vel / 180));
      skew += (targetSkew - skew) * 0.15;
      if (stack) stack.style.transform = "skewX(" + skew.toFixed(2) + "deg)";
    }

    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();