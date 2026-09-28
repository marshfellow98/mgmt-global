# Service PDFs

Regenerates the three service one-pagers in `public/downloads/`.

The brand fonts aren't in this repo — they're fetched from npm and converted,
since reportlab needs TTF and fontsource ships woff:

```bash
cd /tmp && mkdir -p pdffonts && cd pdffonts
npm install @fontsource/source-serif-4 @fontsource/schibsted-grotesk
pip install fonttools brotli reportlab
# convert woff -> ttf into /tmp/pdffonts/ttf (see build.py FONT_DIR)
```

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
