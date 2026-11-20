/* The Boxing Folder: page behaviour. Everything you might change lives in CONFIG. */
const CONFIG = {
  // Main checkout (every GET THE GUIDE button). Prices on the page are shown in US dollars only.
  CHECKOUT_URL_USD: "", // PLACEHOLDER [CHECKOUT_URL_USD]
  // Optional rupee/UPI checkout. When set, a small "Paying from India? Pay with UPI" link appears
  // under the pricing button. No rupee price is shown anywhere on the page.
  CHECKOUT_URL_INR: "", // PLACEHOLDER [CHECKOUT_URL_INR]

  PRICE_USD: 4.99, // the real price today

  // "standard": real price, no timer, no strikethrough.
  // "launch": allowed only with a real future price AND a real date when the price rises.
  OFFER_MODE: "standard",
  FUTURE_PRICE_USD: null, // PLACEHOLDER [FUTURE_PRICE_USD]
  PRICE_CHANGE_AT: "",    // PLACEHOLDER [PRICE_CHANGE_DATE_TIME_IST], e.g. "2026-12-31T23:59:00+05:30"

  // Testimonials: one-line switch. Only entries with permission_confirmed: true are ever shown.
  SHOW_TESTIMONIALS: false,

  CREATOR_HANDLE: "",     // optional footer line, e.g. "@yourhandle". Leave empty for none.
  WEEK1_PREVIEW_URL: "",  // optional link to a free Week 1 preview PDF
};

(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const isNum = (n) => typeof n === "number" && isFinite(n) && n > 0;
  const isUrl = (u) => typeof u === "string" && /^https:\/\//.test(u);

  /* ---------- Prices ---------- */
  const money = (n) => n.toFixed(2);
  const istFmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });

  function launchSettings() {
    if (CONFIG.OFFER_MODE !== "launch") return null;
    const deadline = Date.parse(CONFIG.PRICE_CHANGE_AT);
    if (!isFinite(deadline) || !isNum(CONFIG.FUTURE_PRICE_USD) || CONFIG.FUTURE_PRICE_USD <= CONFIG.PRICE_USD) {
      console.warn("[Boxing Folder] Launch mode needs a real future price and a real deadline. Showing the standard price.");
      return null;
    }
    return { deadline };
  }
  const launch = launchSettings();

  // Which price applies right now. After the deadline the future price becomes the price.
  function current(now) {
    const live = !!launch && now < launch.deadline;
    const after = !!launch && now >= launch.deadline;
    return { live, usd: after ? CONFIG.FUTURE_PRICE_USD : CONFIG.PRICE_USD };
  }

  function renderPrices(now) {
    const p = current(now);
    $$("[data-price]").forEach((el) => { el.innerHTML = '<span class="cur">$</span>' + money(p.usd); });
    $$("[data-price-inline]").forEach((el) => { el.textContent = "$" + money(p.usd); });
    $$("[data-was]").forEach((el) => {
      if (p.live) {
        el.textContent = "$" + money(CONFIG.FUTURE_PRICE_USD);
        el.setAttribute("aria-label", "Price after launch: $" + money(CONFIG.FUTURE_PRICE_USD));
        el.hidden = false;
      } else { el.hidden = true; el.textContent = ""; }
    });
    $$("[data-launch]").forEach((el) => { el.hidden = !p.live; });
    if (p.live) {
      // Percentage computed from the two real prices.
      const pct = Math.round(((CONFIG.FUTURE_PRICE_USD - CONFIG.PRICE_USD) / CONFIG.FUTURE_PRICE_USD) * 100);
      $$("[data-launch-off]").forEach((el) => { el.textContent = pct + "% off"; });
      $$("[data-launch-date]").forEach((el) => {
        el.dateTime = new Date(launch.deadline).toISOString();
        el.textContent = istFmt.format(launch.deadline) + " IST";
      });
    }
  }

  /* ---------- Countdown: always measured against the fixed deadline, never stored ---------- */
  function startCountdown() {
    if (!launch) return;
    const pad = (n) => String(n).padStart(2, "0");
    let lastLive = null;
    let timer = null;
    function tick() {
      const now = Date.now();
      const live = now < launch.deadline;
      if (live !== lastLive) { renderPrices(now); lastLive = live; }
      if (!live) { if (timer) clearInterval(timer); return; }
      let s = Math.max(0, Math.floor((launch.deadline - now) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      const text = (d ? d + "d " : "") + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
      $$("[data-countdown]").forEach((el) => { el.textContent = text; });
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  // Standard mode needs no work: the HTML already shows the real price.
  if (launch) startCountdown();
  else if (CONFIG.PRICE_USD !== 4.99) renderPrices(Date.now());

  /* ---------- Checkout links ---------- */
  const toast = document.querySelector("[data-toast]");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }
  $$("[data-checkout]").forEach((a) => {
    const upi = a.dataset.checkout === "upi";
    const url = upi ? CONFIG.CHECKOUT_URL_INR : CONFIG.CHECKOUT_URL_USD;
    if (isUrl(url)) {
      a.href = url;
      a.rel = "noopener";
    } else if (a.closest("#pricing")) {
      // In the pricing block there is nowhere further to scroll, so say what's missing.
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showToast("Checkout link not set yet: [CHECKOUT_URL_USD]");
      });
    }
  });
  if (isUrl(CONFIG.CHECKOUT_URL_INR)) document.querySelector("[data-upi]").hidden = false;

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

  /* ---------- Header: transparent over the title, solid once the title pill scrolls away ---------- */
  const header = document.querySelector("[data-header]");
  new IntersectionObserver(([e]) => {
    header.classList.toggle("is-over", e.isIntersecting);
  }, { rootMargin: "-64px 0px 0px 0px" }).observe(document.querySelector(".hero-title"));

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
