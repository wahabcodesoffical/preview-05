/* C.T Build It — demo concept interactions
   - Mobile nav toggle
   - Sticky header state
   - GSAP hero intro + scroll reveals (graceful if CDN fails)
   - Demo quote form (non-functional by design)
*/
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Demo quote form (does NOT send data anywhere) ---------- */
  var form = document.getElementById("quote-form");
  var notice = document.getElementById("form-notice");
  if (form && notice) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // demo only — no backend, no data collection
      notice.hidden = false;
      notice.setAttribute("tabindex", "-1");
      notice.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "nearest" });
      notice.focus({ preventScroll: true });
    });
  }

  /* ---------- GSAP animations ---------- */
  var hasGsap = typeof window.gsap !== "undefined";
  var root = document.documentElement;

  if (!hasGsap || prefersReduced) {
    root.classList.add("no-anim");
    return; // content stays fully visible without animation
  }
  root.classList.add("js-anim");

  var hasTrigger = typeof window.ScrollTrigger !== "undefined";
  if (hasTrigger) gsap.registerPlugin(ScrollTrigger);

  /* Set initial hidden states immediately (no flash) */
  gsap.set("[data-hero]", { opacity: 0, y: 30 });
  if (hasTrigger) gsap.set("[data-reveal]", { opacity: 0, y: 44 });

  /* Hero intro: word-mask stagger on the H1 */
  var h1 = document.getElementById("hero-title");
  if (h1) {
    // Split into word spans for a masked rise effect
    var nodes = Array.prototype.slice.call(h1.childNodes);
    h1.innerHTML = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            h1.appendChild(document.createTextNode(" "));
          } else {
            var w = document.createElement("span");
            w.className = "w-mask";
            w.innerHTML = '<span class="w-word">' + part + "</span>";
            h1.appendChild(w);
          }
        });
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        h1.appendChild(document.createElement("br"));
      } else {
        // accent span — split its words too, keep accent class on inner words
        var accent = node.classList.contains("accent");
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            h1.appendChild(document.createTextNode(" "));
          } else {
            var w2 = document.createElement("span");
            w2.className = "w-mask";
            w2.innerHTML = '<span class="w-word' + (accent ? " accent" : "") + '">' + part + "</span>";
            h1.appendChild(w2);
          }
        });
      }
    });

    gsap.set(".w-word", { yPercent: 110 });

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".hero__bg", { scale: 1.06, duration: 2.4, ease: "power2.out" }, 0)
      .to("[data-hero]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.15)
      .to(".w-word", { yPercent: 0, duration: 0.85, stagger: 0.05 }, 0.2);
  } else {
    gsap.to("[data-hero]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 });
  }

  /* Hero background parallax scrub */
  if (hasTrigger) {
    gsap.to(".hero__bg", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* Scroll reveals */
  if (hasTrigger) {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    /* Card image settle zoom */
    gsap.utils.toArray(".card__media img").forEach(function (img) {
      gsap.fromTo(
        img,
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: img, start: "top 95%", end: "top 45%", scrub: true }
        }
      );
    });
  } else {
    gsap.to("[data-reveal]", { opacity: 1, y: 0, duration: 0.6 });
  }
})();
