/* ==========================================================
   GET FADES — reviews.js (v2)
   Kinukuha sa data.js (GETFADES_DATA.reviews):
   - rating at count (summary)
   - items: mga review cards (manual, kopya ng totoong reviews)
   Isang lugar lang ang papalitan mo: data.js.
   ========================================================== */

(function () {
  "use strict";

  var DATA = window.GETFADES_DATA || null;
  var r = DATA && DATA.reviews;
  var section = document.getElementById("reviews");
  if (!r || !section) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* ---------- Summary ---------- */
  var score = section.querySelector('[data-reviews="rating"]');
  var meta = section.querySelector('[data-reviews="meta"]');
  var link = section.querySelector('[data-reviews="link"]');

  if (score && typeof r.rating === "number") score.textContent = r.rating.toFixed(1);
  if (meta && typeof r.count === "number") {
    var label = r.count === 1 ? "review" : "reviews";
    meta.textContent = (r.source || "Google Maps") + " rating summary · " + r.count + " " + label;
  }
  if (link && r.url) link.href = r.url;

  /* ---------- Review cards ---------- */
  var list = section.querySelector('[data-reviews="list"]');
  var items = Array.isArray(r.items) ? r.items.filter(function (it) { return it && it.name && it.text; }) : [];
  if (!list) return;
  if (!items.length) { list.hidden = true; return; }

  list.textContent = "";
  items.forEach(function (it) {
    var stars = Math.max(1, Math.min(5, Number(it.stars) || 5));

    var card = el("figure", "review");
    var starsEl = el("p", "review__stars");
    starsEl.setAttribute("aria-label", stars + " out of 5 stars");
    starsEl.textContent = "★".repeat(stars) + "☆".repeat(5 - stars);
    starsEl.firstChild && starsEl.setAttribute("role", "img");

    var quote = el("blockquote", "review__text");
    quote.appendChild(el("p", "", it.text));

    var cap = el("figcaption", "review__by");
    cap.appendChild(el("span", "review__name", it.name));
    cap.appendChild(el("span", "review__src", r.source ? r.source + " review" : "Google review"));

    card.appendChild(starsEl);
    card.appendChild(quote);
    card.appendChild(cap);
    list.appendChild(card);
  });
})();