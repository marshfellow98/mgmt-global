# Service PDFs

Regenerates the three service one-pagers in `public/downloads/`.

The brand fonts aren't in this repo — they're fetched from npm and converted,
since reportlab needs TTF and fontsource ships woff:

```bash
cd /tmp && mkdir -p pdffonts && cd pdffonts
npm install @fontsource/source-serif-4 @fontsource/schibsted-grotesk
pip install fonttools brotli reportlab svglib
# convert woff2 -> ttf into /tmp/pdffonts/ttf (see build.py FONT_DIR)
```

`svglib` is what draws the logo. It converts the brand SVGs straight to
reportlab vector shapes, so the PDF carries the same artwork the site serves
with no raster step.

Then:

```bash
cd tools && python3 build.py
cp out/*.pdf ../public/downloads/
```

**Copy lives in `content.py`,** not in the layout code. Edit it there.

## Design notes

Dark cover, light interior. The brand is dark and the cover should read as
the site, but these get printed — a fully dark PDF is unreadable on paper and
an ink disaster. Dark cover plus light interior solves both.

Two pages each, down from the original three. A leave-behind should be
shorter than the website, not the same length.

Retained Search went from eight steps to four, matching the site and the
pitch deck. Three descriptions of one process that don't agree is worse than
one that does.


## The logo

Drawn from the brand SVGs in `public/` — the same files the website loads, not
copies. `logo()` in `build.py` handles it.

**Pick the variant for the background.** `logo.svg` has a white wordmark and
belongs on the dark cover; `logo-light.svg` has a dark wordmark and belongs on
the cream interior. Swap them and the wordmark disappears into the page.

**Don't re-approximate it.** The first version of these PDFs drew the swoosh
as three bezier strokes and set "MGMT" in Source Serif. The real swoosh is a
tight gold fan locked up immediately left of the wordmark, and the wordmark's
letterforms are custom — so the approximation rendered as a large detached arc
floating above some serif text. It didn't read as the firm's logo at all.
`verify.mjs` check 20 fails the build if the generator stops drawing the SVGs.

## Fonts: both defaults have to be set

`register_fonts()` overrides two separate default fonts, and both matter:

- `canvas.Canvas(..., initialFontName="Sans")` — reportlab otherwise selects
  Helvetica and writes it into every page's resources.
- `STATE_DEFAULTS["fontName"]` — reportlab's graphics layer, which svglib
  renders through, otherwise contributes Times-Roman.

Neither is ever used to draw a glyph, but both land in the font resources as
non-embedded base-14 fonts, so the PDFs advertise two typefaces they don't
carry. `verify.mjs` byte-scans the output and fails on any font that isn't an
embedded Schibsted Grotesk or Source Serif 4 subset.
