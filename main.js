/* The Boxing Folder: page behaviour. Everything you might change lives in CONFIG. */
const CONFIG = {
  // Polar checkout link used by every GET THE GUIDE button.
  // Polar picks the currency from the buyer's location. India: ₹999 minus the ₹800 launch
  // discount = ₹199. Every other country: $9.99 minus the $5 launch discount = $4.99.
  // The page shows the matching prices: index.html holds both ($9.99 / $4.99 and ₹999 / ₹199),
  // and a small script in its <head> shows rupees when the visitor connects from India
  // (country from the host, like Polar's checkout; device time zone only as a fallback).
  CHECKOUT_URL: "https://buy.polar.sh/polar_cl_VOzCwTrrZxAzTR7jQcYv566bgtxMAzuw8viXe2C8SlW",

  // Testimonials: one-line switch. Only entries with permission_confirmed: true are ever shown.
  SHOW_TESTIMONIALS: false,

  CREATOR_HANDLE: "",     // optional footer line, e.g. "@yourhandle". Leave empty for none.
  WEEK1_PREVIEW_URL: "",  // optional link to a free Week 1 preview PDF
};

(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const isUrl = (u) => typeof u === "string" && /^https:\/\//.test(u);

  /* ---------- Checkout links ---------- */
  if (isUrl(CONFIG.CHECKOUT_URL)) {
    $$("[data-checkout]").forEach((a) => { a.href = CONFIG.CHECKOUT_URL; });
  }

  /* ---------- Small config-driven bits ---------- */
  if (CONFIG.CREATOR_HANDLE) {
    const c = document.querySelector("[data-creator]");
    c.textContent = " · " + CONFIG.CREATOR_HANDLE;
    c.hidden = false;
  }
  $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  if (isUrl(CONFIG.WEEK1_PREVIEW_URL) || /^[\w./-]+\.pdf$/.test(CONFIG.WEEK1_PREVIEW_URL)) {
    const p = document.querySelector("[data-preview]");
    p.querySelector("a").href = CONFIG.WEEK1_PREVIEW_URL;
    p.hidden = false;
  }

  /* ---------- Testimonials ---------- */
  if (CONFIG.SHOW_TESTIMONIALS) {
    fetch("testimonials.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const list = (Array.isArray(data) ? data : data.testimonials || [])
          .filter((t) => t && t.permission_confirmed === true && t.quote && t.name);
        if (!list.length) return;
        const box = document.querySelector("[data-testimonials]");
        list.forEach((t) => {
          const fig = document.createElement("figure");
          fig.className = "testimonial";
          const q = document.createElement("blockquote");
          q.textContent = "“" + t.quote + "”";
          const cap = document.createElement("figcaption");
          const n = document.createElement("strong");
          n.textContent = t.name;
          cap.appendChild(n);
          if (t.detail) { const d = document.createElement("span"); d.textContent = t.detail; cap.appendChild(d); }
          fig.append(q, cap);
          box.appendChild(fig);
        });
        document.getElementById("testimonials").hidden = false;
      })
      .catch(() => { /* stay hidden */ });
  }

  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    document.querySelector("[data-header]").classList.remove("is-over");
    return;
  }

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Header: hidden at top over hero, shown with logo + CTA on scroll ---------- */
  const header = document.querySelector("[data-header]");
  const headerLinks = $$("a", header);
  const setHeaderOver = (over) => {
    header.classList.toggle("is-over", over);
    header.setAttribute("aria-hidden", over ? "true" : "false");
    headerLinks.forEach((a) => { a.tabIndex = over ? -1 : 0; });
  };
  setHeaderOver(true);
  new IntersectionObserver(([e]) => {
    setHeaderOver(e.isIntersecting);
  }, { rootMargin: "0px 0px 0px 0px" }).observe(document.querySelector(".hero-title"));

  /* ---------- Sticky phone CTA ---------- */
  // Shown once the hero price has scrolled away; hidden while the pricing block, final CTA or footer is on screen.
  const bar = document.querySelector("[data-sticky]");
  const barLink = bar.querySelector("a");
  const visible = new Set();
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    const on = visible.size === 0;
    bar.classList.toggle("is-on", on);
    bar.setAttribute("aria-hidden", on ? "false" : "true");
    barLink.tabIndex = on ? 0 : -1;
  });
  ["[data-hero-cta]", "#pricing .offer-body", "#faq details:last-of-type", "#safety", "#final", ".site-footer"].forEach((s) => {
    const el = document.querySelector(s);
    if (el) io2.observe(el);
  });
})();
