# The Boxing Folder: build report (v2)

Live at https://theboxingfolder.onrender.com (Render static site, deployed from this repo's `main` branch; every push redeploys).

Updated 20 Nov 2026 after your feedback. Static site, previewed locally only. Nothing deployed, published or connected.

## What changed in v2
- **Title at the very top.** The floating "The Boxing Folder" pill is the first thing in the hero. The header's small wordmark stays hidden until the pill scrolls away, so the name isn't shown twice.
- **The book is the focus.** It's a 3D book mock-up with page edges, spine shading and a real shadow, sitting on a textured ember backdrop (original art, made in code, no photos).
- **Big $4.99, mirrored with the book.** On desktop the tagline sits on the left of the book and the price on the right, both lined up against it. On phones the price sits directly under the book, at about 94 px tall on a 390 px screen.
- **No INR anywhere on the page.** Every price is in US dollars. Every GET THE GUIDE button goes to the USD checkout. If you add an INR checkout link, a small "Paying from India? Pay with UPI" link appears under the pricing button, still with no rupee price.
- **Livelier, less templated:** a cream ticker band of punch names, ember highlights in the intro and manifesto, an editorial "What's inside" list with big numbers instead of boxed cards, outlined week numbers 1 to 4, a solid ember band for the "Hands up" line, a second textured pricing section with the book, and a giant ember wordmark in the footer.

## Files
- `index.html`, `styles.css`, `main.js` (one `CONFIG` block at the top), `testimonials.json`, `privacy.html`, `terms.html`, `refund.html`.
- `assets/fonts/`: Inter, self-hosted.
- `assets/img/`: `texture-*` (backdrop), `book-*` (book mock-up), `pages-*` (sample pages), `og-image.jpg` (1200×630).

## Borrowed from the reference vs. changed
Borrowed: a full-bleed textured hero with the product at its centre, the slim header with one button, the pill badge, big editorial type, a one-sentence pause, the numbered 01–05 list, a giant wordmark at the foot of the page, and the overall rhythm.

Changed: an ember colour scheme, a different texture, Inter type and the side-by-side tagline/price layout. Removed the author section, "As seen on", logos, stockists, editorial cards, the cookie bar and all third-party names. All copy is new: no 5-word run on the page matches the reference.

## Offer mode
`OFFER_MODE: "standard"`: $4.99 only. No timer, no strikethrough, no "% off".

Launch mode is built but off. It turns on only when `FUTURE_PRICE_USD` and `PRICE_CHANGE_AT` are real and the future price is higher. I tested it with sample values that are not in the shipped settings ($4.99 → $9.99, ending 22 Nov 2026 11:59 pm IST):
- It showed 50% off, computed in code.
- It kept the same deadline after a reload, after clearing storage, in a fresh private context, and with the clock moved a day later.
- It switched to $9.99, with the strip and strikethrough gone, both live as the deadline passed and when loading after it.
- It stored nothing in the browser.

## Testimonials
The section is hidden: `testimonials.json` is empty and `SHOW_TESTIMONIALS` is `false`. Only entries with `permission_confirmed: true` ever render. There are no star ratings or scarcity counters anywhere.

## Placeholders still owed
| Placeholder | Where |
| --- | --- |
| `[CHECKOUT_URL_USD]` | `CONFIG` in `main.js`. Until it's set, buttons scroll to pricing, and the pricing button says the link isn't set |
| `[CHECKOUT_URL_INR]` (optional) | `CONFIG` in `main.js`. Shows the UPI link when set |
| `[CONTACT_EMAIL]` | `CONFIG`, plus the privacy and refund pages |
| `[REFUND_POLICY]` | FAQ, plus `refund.html` |
| `[DELIVERY_DETAILS]` | FAQ "How is it delivered?" |
| `[PRIVACY_DETAILS]`, `[TERMS_DETAILS]` | legal pages |
| Optional | `CREATOR_HANDLE`, `WEEK1_PREVIEW_URL`, and the launch-mode values |

## Checks run
- At 360, 390, 412, 768 and 1440 px: no sideways scroll, the title stays on one line, there are no console errors, and every tap target is at least 48 px. Layout shift is 0.
- Contrast is measured against the actual texture pixels behind each line. All small text on the textured areas is 5.6:1 or better. The badge sits on a dark fill.
- The sticky phone bar hides while the hero price, the pricing block, the last FAQ item, the safety note, the final CTA or the footer is on screen.
- With reduced motion on, the float, glow, ticker and scroll reveal are all off. The FAQ opens from the keyboard.
- No cookies, no storage, no third-party requests, and no ₹ or "INR" in the visible text.

Lighthouse on mobile settings (median of 3 runs): **Performance 99, Accessibility 100, Best Practices 100, SEO 100.** Main image loads in 1.8 s (LCP), layout shift 0, total page weight 138 KB.

Not tested: the real Instagram in-app browser on iOS and Android. I tested in Chrome set up to behave like a phone at 360, 390 and 412 px.
