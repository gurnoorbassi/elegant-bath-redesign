# Elegant Bath redesign

Showroom site for Elegant Bath, a kitchen and bath supplier in Surrey, BC. The public business site is [elegantbath.ca](https://www.elegantbath.ca/). This repository is that redesign. It does not contain a Netlify site id, and the live demo at `https://elegant-bath-showroom-demo.netlify.app` was an uploaded folder, not a connected git deploy. The demo HTML is preserved byte for byte in `archive/demo-source-recovery.zip`.

## Pages

Home, About, Fixtures, Spaces, Consult, and Visit. Those are the six linked demo URLs (`/`, `/about`, `/products`, `/portfolio`, `/design`, `/contact`), kept as HTML files. `_redirects` maps the extensionless paths.

## Handoff

- Weekday close on these pages is 5:30 p.m., taken from the demo. elegantbath.ca says 5:00 p.m. Saturday 4:00 p.m. and Sunday closed match. Do not treat 5:30 as confirmed until the showroom says so.
- The recovered demo HTML had no `noindex` meta, and the homepage response had no `X-Robots-Tag`. This preview sends `noindex` anyway, because it is not the production site.
- The official header uses `tel:6045387333` while the visible number is (778) 589-9125. The footer of elegantbath.ca uses 778. This site uses (778) 589-9125 only.
- Named quotes on the demo and on elegantbath.ca are not repeated. They have no platform, count, or date, and the official catalog also has unrelated spam titles.
- Instagram photos are the five files in `assets/ig/`, at their real pixel size. The master ensuite image is a 415×550 screenshot crop. Brizo, Rubinet, and Kohler posts are links only, because the saved previews had a play control baked in. Only the May 13, 2026 caption says Elegant Bath supplied fixtures. Nothing here says the showroom built or installed a home.
- Wide photos are banners from elegantbath.ca (`slide2.jpg` through `slide8.jpg`). They are product pictures, not labeled jobs.
- The consult form checks fields in the browser and does not send mail.
- This change is not deployed.

## Local check

Open `index.html` through a local static server so the font and image paths resolve. `python3 tests/check_site.py` checks links, files, and copy limits. `node tests/interact.mjs` opens the pages in Chrome.
