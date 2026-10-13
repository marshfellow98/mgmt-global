"""
Builds the three service one-pagers in the site's own brand.

Design decisions:

- Dark cover, light interior. The brand is dark, and a dark cover reads as
  the site. But these get printed, and a fully dark PDF is both unreadable
  on paper and an ink disaster. Dark cover plus light interior is the
  standard premium answer and solves both.

- The real brand fonts, pulled from npm and converted to TTF, so the type is
  identical to the website rather than a lookalike.

- The gold arc from the logo appears on the cover — the one piece of ornament
  drawn from the firm's own identity rather than a general vocabulary.

- Two pages each, down from three. A leave-behind should be shorter than the
  website, not the same length.
"""

import os
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.graphics import renderPDF

from content import DOCS, CONTACT, GOLD, INK, RULE, MUTED, BODY

FONT_DIR = "/tmp/pdffonts/ttf"
OUT_DIR = os.path.join(os.path.dirname(__file__), "out")
# The brand SVGs the site serves — same files, not copies.
PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")

W, H = LETTER
M = 58                      # page margin
GOLD_C = HexColor(GOLD)
INK_C = HexColor(INK)
RULE_C = HexColor(RULE)
MUTED_C = HexColor(MUTED)
BODY_C = HexColor(BODY)


def register_fonts():
    """Register the brand faces, and make them the defaults.

    Both default-font lines matter for a clean PDF: reportlab's canvas
    defaults to Helvetica and its graphics layer (which svglib renders
    through) defaults to Times-Roman. Neither is ever used to draw a glyph
    here, but both get written into the page's font resources as
    non-embedded base-14 fonts, so `pdffonts` reports two typefaces the
    document doesn't carry and doesn't use.
    """
    faces = {
        "Serif": "SourceSerif-Regular.ttf",
        "Serif-SB": "SourceSerif-SemiBold.ttf",
        "Serif-SBI": "SourceSerif-SemiBoldItalic.ttf",
        "Sans": "Schibsted-Regular.ttf",
        "Sans-SB": "Schibsted-SemiBold.ttf",
        "Sans-B": "Schibsted-Bold.ttf",
    }
    for name, f in faces.items():
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, f)))

    from reportlab.graphics.shapes import STATE_DEFAULTS
    STATE_DEFAULTS["fontName"] = "Sans"


_LOGO_CACHE = {}


def logo(c, x, top, variant="logo.svg", width=160.0):
    """Draw the real logo as vector, anchored by its top-left corner.

    This replaces a hand-drawn approximation: three bezier strokes standing in
    for the swoosh, plus the word "MGMT" typeset in Source Serif. Those were
    never the logo. The swoosh in the real mark is a tight gold fan locked up
    immediately left of the wordmark; the approximation rendered it as a large
    detached arc floating well above the type, and the wordmark's letterforms
    are custom, not Source Serif. On the cover it read as an unrelated
    ornament sitting over some serif text.

    The brand SVGs are outlined paths with no text elements, so svglib
    converts them to reportlab vector shapes exactly — the PDF carries the
    same artwork the website serves, at any zoom, with no raster step.

    `variant` must suit the background: logo.svg (white wordmark, gold
    swoosh) on the dark cover, logo-light.svg (dark wordmark, gold swoosh) on
    the cream interior. Using the wrong one makes the wordmark vanish.
    """
    if variant not in _LOGO_CACHE:
        import re
        from svglib.svglib import svg2rlg

        src = os.path.join(PUBLIC, variant if variant == "logo.svg" else os.path.join("brand", variant))
        raw = open(src, encoding="utf-8").read()
        # The brand files carry a large c2pa metadata block. It isn't artwork
        # and svglib has no reason to parse it.
        cleaned = re.sub(r"<metadata>.*?</metadata>", "", raw, flags=re.S)
        tmp = os.path.join(OUT_DIR, f"_{variant}")
        os.makedirs(OUT_DIR, exist_ok=True)
        with open(tmp, "w", encoding="utf-8") as fh:
            fh.write(cleaned)
        _LOGO_CACHE[variant] = svg2rlg(tmp)
        os.remove(tmp)

    from copy import deepcopy

    d = deepcopy(_LOGO_CACHE[variant])
    s = width / d.width
    d.scale(s, s)
    d.width *= s
    d.height *= s
    # renderPDF leaves font and colour state behind it, so fence it off.
    c.saveState()
    renderPDF.draw(d, c, x, top - d.height)
    c.restoreState()
    return d.height


def tracked(c, x, y, text, font, size, spacing, color):
    """Letter-spaced text — reportlab has no tracking, so draw per glyph."""
    c.setFont(font, size)
    c.setFillColor(color)
    for ch in text:
        c.drawString(x, y, ch)
        x += pdfmetrics.stringWidth(ch, font, size) + spacing
    return x


def wrapped(c, x, y, text, font, size, leading, color, width):
    c.setFont(font, size)
    c.setFillColor(color)
    for line in simpleSplit(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def kicker(c, x, y, text):
    """Gold rule plus letter-spaced label — the site's section marker."""
    c.setStrokeColor(GOLD_C)
    c.setLineWidth(1)
    c.line(x, y + 3, x + 26, y + 3)
    tracked(c, x + 36, y, text.upper(), "Sans-SB", 7.5, 1.9, GOLD_C)


def cover(c, doc):
    c.setFillColor(INK_C)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # The logo — the real artwork, white wordmark for the dark cover.
    logo(c, M, H - 92, "logo.svg", width=168)

    # Document label
    kicker(c, M, 300, doc["eyebrow"])

    # Title
    y = 258
    c.setFillColor(white)
    for i, line in enumerate(doc["title"].split("\n")):
        c.setFont("Serif-SBI" if i else "Serif-SB", 33)
        c.setFillColor(GOLD_C if i else white)
        c.drawString(M, y, line)
        y -= 40

    # Lede
    wrapped(c, M, y - 14, doc["lede"], "Sans", 10.5, 16.5, HexColor("#AFBAC4"), W - M * 2 - 120)

    # Footer
    c.setFillColor(HexColor("#46525F"))
    c.setFont("Sans", 8)
    c.drawString(M, 46, CONTACT["site"])
    c.drawRightString(W - M, 46, f'{CONTACT["email"]}   ·   {CONTACT["phone"]}')

    c.showPage()


def interior(c, doc):
    """Light page carrying both content sections."""
    c.setFillColor(HexColor("#FBFAF7"))
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # Running head. The logo proper, dark-wordmark variant for the cream
    # page — this was "MGMT GLOBAL CONSULTING" set as letter-spaced type,
    # which is a caption, not the mark.
    logo(c, M, H - 28, "logo-light.svg", width=92)
    c.setFont("Sans", 6.5)
    c.setFillColor(MUTED_C)
    c.drawRightString(W - M, H - 52, doc["eyebrow"].upper())
    c.setStrokeColor(RULE_C)
    c.setLineWidth(0.6)
    c.line(M, H - 64, W - M, H - 64)

    y = H - 110

    for si, sec in enumerate(doc["sections"]):
        if si:
            y -= 22
            c.setStrokeColor(RULE_C)
            c.line(M, y, W - M, y)
            y -= 40

        kicker(c, M, y, sec["kick"])
        y -= 30

        c.setFont("Serif-SB", 20)
        c.setFillColor(INK_C)
        c.drawString(M, y, sec["heading"])
        y -= 24

        if sec.get("intro"):
            y = wrapped(c, M, y, sec["intro"], "Sans", 9.5, 15, MUTED_C, W - M * 2 - 90)
            y -= 10

        if sec.get("steps"):
            for num, title, body in sec["steps"]:
                c.setFont("Serif-SB", 15)
                c.setFillColor(GOLD_C)
                c.drawString(M, y - 2, num)

                c.setFont("Sans-SB", 10.5)
                c.setFillColor(INK_C)
                c.drawString(M + 34, y, title)

                yy = wrapped(c, M + 34, y - 15, body, "Sans", 9.2, 13.5, BODY_C, W - M * 2 - 34)
                y = yy - 12

        if sec.get("columns"):
            # The gold rule sits 12pt above each column title, so without this
            # the rules crowd the section heading above.
            y -= 18
            col_w = (W - M * 2 - 26) / 2
            start_y = y
            for i, (title, body) in enumerate(sec["columns"]):
                cx = M if i % 2 == 0 else M + col_w + 26
                if i % 2 == 0 and i:
                    start_y = y
                cy = start_y

                c.setStrokeColor(GOLD_C)
                c.setLineWidth(1.4)
                c.line(cx, cy + 12, cx + 30, cy + 12)

                c.setFont("Sans-SB", 10)
                c.setFillColor(INK_C)
                c.drawString(cx, cy, title)

                end = wrapped(c, cx, cy - 15, body, "Sans", 9.2, 13.5, BODY_C, col_w - 8)
                if i % 2 == 1:
                    y = min(y, end) - 20
                else:
                    y = min(y, end)

    # Footer
    c.setStrokeColor(RULE_C)
    c.setLineWidth(0.6)
    c.line(M, 62, W - M, 62)
    c.setFont("Sans", 8)
    c.setFillColor(MUTED_C)
    c.drawString(M, 46, f'{CONTACT["location"]}   ·   {CONTACT["site"]}')
    c.drawRightString(W - M, 46, f'{CONTACT["email"]}   ·   {CONTACT["phone"]}')

    c.showPage()


def build(doc):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f'mgmtglobal-{doc["slug"]}.pdf')
    # initialFontName keeps Helvetica out of the page resources. reportlab
    # selects Helvetica by default and writes it into every page whether or
    # not a glyph is ever drawn with it, which leaves a client-facing PDF
    # advertising a font it doesn't embed.
    c = canvas.Canvas(path, pagesize=LETTER, initialFontName="Sans", initialFontSize=10)
    c.setTitle(f'MGMTGlobal — {doc["eyebrow"]}')
    c.setAuthor("MGMT Global Consulting")
    c.setSubject(doc["lede"])
    cover(c, doc)
    interior(c, doc)
    c.save()
    return path


if __name__ == "__main__":
    register_fonts()
    for d in DOCS:
        print("built", build(d))
