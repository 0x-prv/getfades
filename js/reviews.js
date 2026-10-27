/* ==========================================================
   GET FADES — reviews.js (v3)
   Kinukuha sa data.js (GETFADES_DATA.reviews):
   - rating, count, source (summary)
   - url, links.google, links.facebook (buttons)
   - items: review cards (kopya ng totoong reviews)
   Slider: arrows + counter + swipe. Kapag kasya na lahat ng
   cards sa screen, nakatago ang arrows at counter.
   Isang lugar lang ang papalitan mo: data.js.
   ========================================================== */

(function () {
  "use strict";

  var DATA = window.GETFADES_DATA || null;
  var r = DATA && DATA.reviews;
  var section = document.getElementById("reviews");
  if (!r || !section) return;

  function q(name) { return section.querySelector('[data-reviews="' + name + '"]'); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Summary ---------- */
  var score = q("rating");
  var meta = q("meta");
  var gLink = q("link");
  var fLink = q("facebook");
  var links = r.links || {};

  if (score && typeof r.rating === "number") score.textContent = r.rating.toFixed(1);
  if (meta && typeof r.count === "number") {
    var label = r.count === 1 ? "review" : "reviews";
    meta.textContent = (r.source || "Google Maps") + " rating summary \u00B7 " + r.count + " " + label;
  }
  var googleUrl = links.google || r.url;
  if (gLink && googleUrl) gLink.href = googleUrl;
  if (fLink && links.facebook) fLink.href = links.facebook;

  /* ---------- Review cards ---------- */
  var slider = q("slider");
  var list = q("list");
  var controls = q("controls");
  if (!list) return;

  var items = Array.isArray(r.items)
    ? r.items.filter(function (it) { return it && it.name && it.text; })
    : [];

  if (!items.length) {
    if (slider) slider.hidden = true;
    else list.hidden = true;
    return;
  }

  list.textContent = "";
  items.forEach(function (it) {
    var stars = Math.max(1, Math.min(5, Number(it.stars) || 5));

    var card = el("figure", "review");

    var starsEl = el("p", "review__stars");
    starsEl.setAttribute("role", "img");
    starsEl.setAttribute("aria-label", stars + " out of 5 stars");
    starsEl.textContent = "\u2605".repeat(stars) + "\u2606".repeat(5 - stars);

    var quote = el("blockquote", "review__text");
    quote.appendChild(el("p", "", it.text));

    var cap = el("figcaption", "review__by");
    cap.appendChild(el("span", "review__name", it.name));
    cap.appendChild(el("span", "review__src", (r.source || "Google") + " review"));

    card.appendChild(starsEl);
    card.appendChild(quote);
    card.appendChild(cap);
    list.appendChild(card);
  });

  /* ---------- Slider: arrows + counter ---------- */
  var slides = list.children;
  var cur = q("current");
  var total = q("total");
  var prev = q("prev");
  var next = q("next");
  if (!controls || !cur || !total || !prev || !next) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function step() {
    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return slides[0].offsetWidth + gap;
  }
  function fits() {
    return list.scrollWidth <= list.clientWidth + 2;
  }
  function index() {
    if (list.scrollLeft + list.clientWidth >= list.scrollWidth - 2) return slides.length - 1;
    return Math.round(list.scrollLeft / step());
  }
  function update() {
    controls.hidden = fits();
    var i = index();
    cur.textContent = pad(i + 1);
    prev.disabled = i <= 0;
    next.disabled = i >= slides.length - 1;
  }
  function go(dir) {
    var i = Math.max(0, Math.min(slides.length - 1, index() + dir));
    list.scrollTo({ left: i * step(), behavior: reduce ? "auto" : "smooth" });
  }

  total.textContent = pad(slides.length);
  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });
  list.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
  list.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);
  update();
})();