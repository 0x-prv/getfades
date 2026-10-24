/* ==========================================================
   GET FADES — animations.js
   GSAP + ScrollTrigger: hero entrance, scroll reveals,
   staggered lists.
   Walang initial "hidden" CSS. Dito lang sine-set ang hidden
   states, kaya visible pa rin ang content kung pumalya ang
   GSAP/CDN o kung naka-reduced-motion ang user.
   ========================================================== */

(function () {
  "use strict";

  // Kung hindi nag-load ang GSAP, stop. Visible pa rin ang lahat.
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    console.warn("[GET FADES] GSAP did not load. Animations skipped; content stays visible.");
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var $ = function (sel) { return document.querySelector(sel); };

  /* ---------- Hero entrance ---------- */
  function heroIntro() {
    if (!$(".hero")) return;

    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(".hero__media", { scale: 1.15, duration: 2.2, clearProps: "transform" }, 0)
      .from(".nav", { y: -24, opacity: 0, duration: 0.8, clearProps: "all" }, 0.2)
      .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8, clearProps: "all" }, 0.3)
      .from(".hero__title .line__inner", {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.14,
        clearProps: "all"
      }, 0.4)
      .from(".hero__sub", { y: 24, opacity: 0, duration: 0.9, clearProps: "all" }, 0.95)
      .from(".hero__actions > *", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        clearProps: "all"
      }, 1.1)
      .from(".hero__scroll", { opacity: 0, duration: 0.8, clearProps: "all" }, 1.5);
  }

  /* ---------- Scroll reveals (isa-isang element) ---------- */
  function revealOnScroll() {
    gsap.utils.toArray("[data-reveal]").forEach(function (item) {
      gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true
        }
      });
    });
  }

  /* ---------- Staggered groups (services, amenities, barbers, gallery, atbp.) ---------- */
  function staggerOnScroll() {
    var selector = "[data-stagger], .booking__steps li, .hours-row";
    var targets = gsap.utils.toArray(selector);
    if (!targets.length) return;

    gsap.set(targets, { opacity: 0, y: 40 });

    ScrollTrigger.batch(targets, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          overwrite: true,
          clearProps: "transform,opacity"
        });
      }
    });
  }

  /* ---------- Init (respeto sa reduced-motion) ---------- */
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    heroIntro();
    revealOnScroll();
    staggerOnScroll();

    // I-recalculate ang positions kapag tapos na ang images at fonts
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  });
})();