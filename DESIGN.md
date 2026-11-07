---
name: Elegant Bath showroom
colors:
  brand-9: "#093064"
  brand-11: "#092f62"
  brand-7: "#00569e"
  accent-9: "#3ed2f8"
  accent-ink: "#093064"
  neutral-1: "#ffffff"
  neutral-2: "#f3f7fb"
  neutral-12: "#102033"
  neutral-11: "#3c4d63"
  semantic-danger: "#9f1239"
  semantic-success: "#0f5132"
typography:
  display:
    fontFamily: "Fraunces"
    fontSize: "clamp(2.6rem, 5.4vw, 4.6rem)"
    lineHeight: "1.05"
  heading:
    fontFamily: "Fraunces"
    fontSize: "clamp(1.8rem, 3vw, 2.6rem)"
  body:
    fontFamily: "Source Sans 3"
    fontSize: "1.125rem"
  small:
    fontFamily: "Source Sans 3"
    fontSize: "0.9375rem"
rounded:
  control: "6px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "2rem"
  xl: "clamp(4rem, 8vw, 7rem)"
shadow:
  rest: "0 12px 28px rgba(9, 48, 100, 0.12)"
  overlay: "0 18px 40px rgba(9, 48, 100, 0.28)"
motion:
  signature: "one cyan wave stroke draws in 900ms ease-out; buttons change background-color in 160ms"
---

# DESIGN.md

Surrey kitchen and bath showroom. A navy text plate sits on a real product photograph. The official wave logo stays on white. Cyan is the action, not a wash. Instagram photos stay inside their real pixel size.

## Observed, then proposed

Observed on the logo file `logo.png` (335×125, transparent): a navy-to-cyan wave, the word Elegant, and BATH in a heavier navy line. Official CSS at elegantbath.ca uses #093064, #092f62, #00569e, #3ed2f8, and white. The same stylesheet sets Poppins on everything and uses #ea830e only inside an old shadow animation. Poppins and that orange are not carried forward.

Observed on the Netlify demo (archived in `archive/demo-source-recovery.zip`): cream paper, Playfair Display, Inter, an “EB” monogram, Unsplash photos, and two named quotes. The demo is not the look of the official logo.

Observed banners `slide2.jpg` through `slide8.jpg` are 1800×804 product photographs from elegantbath.ca. No project name is on them. They are used large, and every caption says they are not a labeled job.

Observed Instagram files, inspected before use:

- `riobel-brass-faucet.jpg` 640×639, brass faucet, April 25, 2026 product post.
- `luxury-fixture-detail.jpg` 640×640, gold wall faucet, February 5, 2026. Caption does not name an installer. A browser view showed an Ocean Park place tag.
- `custom-bath-inspiration.jpg` 615×614, black tub, January 30, 2026 inspiration. Ocean Park place tag was on the browser view, not in the caption.
- `langley-custom-home.jpg` 615×614, dark paneled wall and oval mirror, January 27, 2026. Caption says Langley custom home. It does not say Elegant Bath built it. Brookswood was a browser place tag.
- `master-ensuite-screenshot-crop.png` 415×550, dark stone vanity. May 13, 2026. This is the only caption that says Elegant Bath supplied the fixtures. It is a screenshot crop, not an original file.

Proposed: Fraunces for display because the headline has to feel cut and specific against the photography, and Source Sans 3 for the reading text. White ground, navy bands, cyan buttons with navy text (white on #3ed2f8 is about 1.8:1, so white is never the button label). No gold or beige as a brand color. Brass and chrome appear only inside the photographs.

## Colour

brand-9 is the text plate and the primary word color. brand-11 is the hours band and the footer. brand-7 is links and the focus ring on white. accent-9 is the button, the wave, and the large closing time. neutral-1 is the page. neutral-2 is the split and the form. neutral-12 is body text. Danger is the form error. Success is reserved and unused on the page.

## Type

Fraunces 600 and Source Sans 3 400/600, files in `assets/fonts/` with `OFL.txt`. At most these sizes. Body 1.125rem. Prose measure about 62 characters. No label sits above the H1.

## Shape, space, motion

One radius on controls. Section padding uses xl. The wave draws once. Buttons change background-color only. `prefers-reduced-motion` stops the wave and the button transition. Instagram cards have no hover scale, so a small file is not blown up.

## Compositions

Hero: official banner, full bleed, navy plate at the top left, one book action and the phone. Split: second banner plus the showroom sentence. Services: a vertical list with icons. Instagram: the 415px ensuite beside a sentence, then other posts at or under their native width. Hours: 5:30 at display size. Area: city names from elegantbath.ca plus one banner. Contact: the phone at display size on a pale band, not the hero photo.

## Directions

Image-led showroom, not a cream serif template and not a gold luxury theme. Featured spaces and product pictures are named separately from fixture supply. Only the May 13 caption is allowed to say the showroom supplied fixtures.

## Claims held back

The demo and elegantbath.ca show named quotes (including Hardeep Heer and Joash Krishna) with no platform, count, or date. The official catalog also contains unrelated spam titles. Neither is republished. “Over 20 years” is quoted as the business’s own line, not a new statistic. Weekday close on this preview is 5:30 p.m. from the demo. elegantbath.ca says 5:00 p.m. See the README handoff. No prices.

## Mapping

Custom properties live in `tokens.css`. `styles.css` uses those variables only.
