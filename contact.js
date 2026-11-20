/* Contact form: sends the message to the mail service, which emails it to the site owner. */
(function () {
  "use strict";
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const API = form.dataset.api;
  const statusEl = form.querySelector("[data-status]");
  const submit = form.querySelector("[data-submit]");

  // The mail service sleeps when idle. Waking it as soon as the page opens means it is ready by the time you finish typing.
  try { fetch(new URL(API).origin + "/health", { mode: "no-cors", cache: "no-store" }).catch(() => {}); } catch (e) { /* ignore */ }

  function setStatus(kind, text) {
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
    statusEl.textContent = text;
  }
  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "SENDING…" : "SEND MESSAGE";
    form.setAttribute("aria-busy", busy ? "true" : "false");
  }
  function showDone(name, email) {
    const box = document.createElement("div");
    box.className = "form-done";
    box.setAttribute("role", "status");
    const h = document.createElement("h2");
    h.textContent = "Message sent";
    const p = document.createElement("p");
    p.textContent = "Thanks" + (name ? ", " + name.split(" ")[0] : "") + ". We'll reply to " + email + " by email.";
    const a = document.createElement("a");
    a.className = "btn btn-sm btn-ghost";
    a.href = "index.html";
    a.textContent = "BACK TO SITE";
    box.append(h, p, a);
    form.replaceWith(box);
    box.setAttribute("tabindex", "-1");
    box.focus({ preventScroll: false });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || ""),
    };
    setBusy(true);
    setStatus("info", "Sending…");
    const slow = setTimeout(() => setStatus("info", "Still sending. The mail server may be waking up, which can take up to a minute."), 6000);
    const ctl = new AbortController();
    const abort = setTimeout(() => ctl.abort(), 75000);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: ctl.signal });
      let j = null;
      try { j = await r.json(); } catch (err) { /* not JSON */ }
      if (r.ok && j && j.ok) { showDone(payload.name, payload.email); return; }
      setStatus("error", (j && j.error) || "Something went wrong. Please try again.");
    } catch (err) {
      setStatus("error", err && err.name === "AbortError"
        ? "This is taking too long. Please try again in a minute."
        : "We couldn't reach the server. Check your connection and try again.");
    } finally {
      clearTimeout(slow);
      clearTimeout(abort);
      if (document.body.contains(submit)) setBusy(false);
    }
  });
})();
