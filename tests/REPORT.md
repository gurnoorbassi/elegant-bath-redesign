# Test report

Date: 2026-11-07. No form was submitted to a server. Nothing was deployed.

## Commands

| Check | Result |
| --- | --- |
| `python3 tests/check_site.py` | pass. 6 pages, local links, image hashes, eight Instagram URLs, noindex, demo 5:30 close. |
| `node tests/interact.mjs` | pass. Images loaded at 390 and 1440, no horizontal overflow, no Instagram image drawn wider than its file, menu open/focus/Escape, product filter left one picture, lightbox stayed within the file width and closed on Escape, empty consult form focused the name error, a valid form showed the not-sent message, no POST. |
| `node checks/design_lint.mjs` on the six pages, `styles.css`, `site.js`, `tokens.css` | 0 FAIL, 2 WARN (header and post-list hairlines). |
| `python3 checks/check_tokens.py styles.css` | tokens ok. |
| `screenshot_page.mjs` + `visual_gate.py` on index, about, products, portfolio, design, contact | visual gate ok on all six. |
| `python3 checks/run_checks.py --root /workspace --all --ui-mode marketing --budget 180` | exit 3, `RESULT: BLOCKED/NOT RUN (not a pass)`. Lint and the five screenshotted gates did not fail. The script skipped `products.html` because of its five-page cap, and it printed a CSS import-coverage notice for `styles.css` and `tokens.css`. Those skips are not a pass. `products.html` was screenshotted and gated on its own in this same run, and that gate passed. |

## LOOK, from the opened PNGs

- Hero: the first screen is a real banner photograph (tub and green wall, bright bath, grey bath, wood vanity, running faucet, dark kitchen). A navy plate holds the type. The photo stays visible beside or under the plate.
- Hierarchy: the Fraunces headline is the large element. The cyan “Book a design consult” button is the strong action. The sentence under the headline is smaller.
- Columns: services are a vertical list. Instagram is one lead photo plus pairs of different photos, then a text list for the three reels. Not a row of equal text cards.
- Sections: photo hero, split, list, Instagram mosaic, navy hours band, city list with a photo, phone band.
- Tablet at 768: the nav becomes Menu because the six links do not fit. The hero photo and the button row are composed for the width, seen on the home and visit shots.
- Mobile at 390: logo, Call, and Menu fit. The headline wraps. Both actions are on screen. The photo is not cropped away.
- CTA: “Book a design consult” is inside the first phone screen and names the consult.

First-screen PNGs and layout JSON are in `tests/screenshots/`. Full-page PNGs are in `work/screenshots/` (that folder is gitignored by the screenshot tool).

Copy polish on 2026-11-07: customer-facing process wording was rewritten. Spaces, fixtures, site check, interaction, design lint, and the Spaces and fixtures visual gates were run again. `run_checks.py` was not re-run. Its earlier exit 3, `BLOCKED/NOT RUN (not a pass)`, still stands because of the five-page cap and the CSS import notice.

## Limits

Instagram files are preview size or a 415×550 screenshot crop. They are not enlarged past those pixels. Reel stills with a baked-in play control are not shown. The consult form does not send. Weekday 5:30 p.m. is the demo hour, not a confirmed change to the 5:00 p.m. line on elegantbath.ca.
