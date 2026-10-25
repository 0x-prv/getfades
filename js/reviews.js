/* ==========================================================
   GET FADES — reviews.js
   Kinukuha ang rating at bilang ng reviews sa data.js
   (GETFADES_DATA.reviews). Isang lugar lang ang papalitan mo:
   rating at count sa data.js. Manual ang update.
   ========================================================== */

(function () {
  "use strict";

  var DATA = window.GETFADES_DATA || null;
  var r = DATA && DATA.reviews;
  var section = document.getElementById("reviews");
  if (!r || !section) return;

  var score = section.querySelector('[data-reviews="rating"]');
  var meta = section.querySelector('[data-reviews="meta"]');
  var link = section.querySelector('[data-reviews="link"]');

  if (score && typeof r.rating === "number") score.textContent = r.rating.toFixed(1);

  if (meta && typeof r.count === "number") {
    var label = r.count === 1 ? "review" : "reviews";
    meta.textContent = (r.source || "Google Maps") + " rating summary · " + r.count + " " + label;
  }

  if (link && r.url) link.href = r.url;
})();