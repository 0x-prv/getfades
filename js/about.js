/* ==========================================================
   GET FADES — about-hero.js
   Dahan-dahang zoom ng about photo habang nag-i-scroll, at
   lumalabas ang caption nang pa-akyat. Kailangan ng GSAP +
   ScrollTrigger (naka-load na). Kung wala, static pa rin ang
   About at walang masisira.
   ========================================================== */

(function () {
  "use strict";

  function init() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var section = document.getElementById("about");
    if (!section) return;
    var img = section.querySelector(".about__banner img");
    var parts = section.querySelectorAll(".about__heading, .about__body p");

    window.gsap.registerPlugin(window.ScrollTrigger);

    if (img) {
      // Zoom papasok habang dumadaan ang section sa screen
      window.gsap.fromTo(
        img,
        { scale: 1 },
        {
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
        }
      );
    }

    if (parts.length) {
      window.gsap.from(parts, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: section, start: "top 55%", once: true }
      });
    }
  }

  // defer scripts: tatakbo pagkatapos ma-parse ang GSAP; load event ay safe fallback
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();