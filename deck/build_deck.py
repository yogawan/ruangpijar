#!/usr/bin/env python3
"""Build the MindCraft deck end to end.

    python deck/build_deck.py

Steps:
  1. rebuild the RuangPijar template from the base (deck/build_template.py)
  2. run the pptx-from-layouts generator over the outline
  3. apply the brand pass the generator cannot do itself
  4. validate

Step 3 exists because `generate.py` writes colours as literal `RGBColor(0, 0, 0)`
rather than theme references — body copy, table header fills and rule shapes all
come out pure black no matter what the template theme says. Only placeholder
text inherited from the slide master (titles) picks up the theme. So the theme
handles backgrounds and titles, and this pass handles everything the generator
hardcodes.

It also fills three gaps the generator leaves in the layouts themselves:

  * picture placeholders are never populated — every one is filled here with the
    app's own illustration for that topic, matted onto a card that matches the
    app's `bg-surface` + `border-border` treatment;
  * grid and table layouts silently drop the outline's `**bold**` headline, so
    it is re-added as a subtitle under the title;
  * the cover layout is a bordered wireframe, so slide 1 is laid out here from
    the text the generator did place.

Nothing is invented: the headlines, notes and cover copy all come from
`Blueprint_PPTX_MindCraft_Web_Competition_2026.md` / the outline.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import PP_PLACEHOLDER
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.util import Emu, Inches, Pt

import build_template as tpl

REPO = Path(__file__).resolve().parent.parent
DECK = REPO / "deck"
SKILL = DECK / "pptx-from-layouts-skill" / ".claude" / "skills" / "pptx-from-layouts"
OUTLINE = DECK / "Outline_MindCraft_Web_Competition_2026.md"
BLUEPRINT = DECK / "Blueprint_PPTX_MindCraft_Web_Competition_2026.md"
OUTPUT = DECK / "RuangPijar_MindCraft_2026.pptx"
CACHE = DECK / ".cache"

BLACK = RGBColor(0x00, 0x00, 0x00)
PLUM = RGBColor.from_string(tpl.PLUM)
PEACH = RGBColor.from_string(tpl.PEACH)
IVORY = RGBColor.from_string(tpl.IVORY)
TEXT_MAIN = RGBColor.from_string(tpl.TEXT_MAIN)
TEXT_MUTED = RGBColor.from_string(tpl.TEXT_MUTED)
WHITE = RGBColor.from_string(tpl.WHITE)


def _rgb(hexcode: str) -> tuple[int, int, int]:
    return tuple(int(hexcode[i:i + 2], 16) for i in (0, 2, 4))


BORDER_RGB = _rgb(tpl.BORDER)
SURFACE_RGB = _rgb(tpl.WHITE)
PLUM_RGB = _rgb(tpl.PLUM)

HEADER_FONT = tpl.HEADER_FONT
BODY_FONT = tpl.BODY_FONT

CLOSING_SLIDE = 15  # 1-based; the full-bleed plum closing from the blueprint
COVER_LAYOUT = 2    # title-centered: the one title layout with no decoration

# Illustrations per slide, in left-to-right placeholder order. Every asset is
# one the app already ships, so the deck and the product read as one system.
ART = {
    2: ["public/01_Akademik.webp", "public/02_Keseharian.webp",
        "public/03_Sosial-Personal.webp", "public/Transparan.webp"],
    3: ["public/hero_images.webp"],
    4: ["public/01_Check-in.webp", "public/02_Jejak.webp",
        "public/03_Insight.webp", "public/04_Ruang.webp"],
    5: ["public/maskot-pijar/Check-in Tutorial.webp"],
    6: ["public/02_Jejak.webp", "public/maskot-pijar/Action Tutorial.webp"],
    7: ["public/02_Jejak-Keseharian.webp", "public/03_Personal-Insight.webp",
        "public/03_Insight.webp", "public/Transparan.webp"],
    8: ["public/04_Ruang-untuk-Bertindak.webp"],
    14: ["public/maskot-pijar/Welcome.webp"],
}

DESIGN_SLIDE = 13   # the UI/UX slide, which proves the system rather than lists it

# The strip along the bottom of the UI/UX slide: the tokens straight out of
# `app/globals.css`, shown rather than described.
SWATCHES = [
    (tpl.IVORY, "Ivory"),
    (tpl.PLUM, "Plum"),
    (tpl.PEACH, "Peach"),
    (tpl.SAGE, "Sage"),
    (tpl.SURFACE_MUTED, "Muted"),
    (tpl.TEXT_MAIN, "Ink"),
]

# Grid layouts stack picture over body with no gap for a subtitle, so the art is
# nudged down to open a band for the headline the generator dropped.
HEADLINE_BAND_TOP = Inches(1.40)
HEADLINE_BAND_HEIGHT = Inches(0.46)
ART_TOP_ON_GRID = Inches(2.02)


# --------------------------------------------------------------------------- #
# image helpers
# --------------------------------------------------------------------------- #

SENTINEL = (255, 0, 255)


def keyed_art(src: Path):
    """Lift the artwork off its baked-in background.

    None of the brand illustrations are cut-outs: each is a 3D render sitting on
    its own near-white card, and some of those cards are tinted or vignetted. Set
    side by side on a slide, the mismatched grounds read as a row of different
    coloured rectangles. Flood-filling in from the corners removes them, so every
    card on a slide shares one surface.

    The tolerance escalates until the outer ring is actually clear — a flat
    ground gives way at 26, `02_Keseharian`'s gradient needs about 70.
    """
    from PIL import Image, ImageDraw

    best = None
    for tol in (26, 40, 55, 70):
        img = Image.open(src).convert("RGB")
        w, h = img.size
        for corner in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
            ImageDraw.floodfill(img, corner, SENTINEL, thresh=tol)

        art = img.convert("RGBA")
        pixels = art.load()
        cleared = 0
        for y in range(h):
            for x in range(w):
                if pixels[x, y][:3] == SENTINEL:
                    pixels[x, y] = (255, 255, 255, 0)
                    cleared += 1
        if cleared > 0.92 * w * h:      # tolerance ate the artwork itself
            break

        ring = [(x, y) for x in range(w) for y in (0, h - 1)]
        ring += [(x, y) for y in range(h) for x in (0, w - 1)]
        clear = sum(1 for x, y in ring if pixels[x, y][3] == 0) / len(ring)
        best = art
        if clear > 0.99:
            break
    return best if best is not None else Image.open(src).convert("RGBA")


def card_png(src: Path, w_in: float, h_in: float, *,
             pad_in: float = 0.32, radius_in: float = 0.20,
             border: bool = True, fill=SURFACE_RGB) -> Path:
    """Render one illustration as an app-style card sized to its placeholder.

    The app draws everything on `bg-surface` + `border-border` rounded cards;
    reproducing that here is what makes the deck look like the product rather
    than a slide deck that happens to contain its icons.
    """
    from PIL import Image, ImageDraw

    dpi = 200
    w, h = int(w_in * dpi), int(h_in * dpi)
    CACHE.mkdir(exist_ok=True)
    tag = f"{w}x{h}-{'b' if border else 'n'}{''.join(f'{c:02x}' for c in fill)}"
    dst = CACHE / f"{src.stem.replace(' ', '-')}-{tag}.png"
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return dst

    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        [0, 0, w - 1, h - 1],
        radius=int(radius_in * dpi),
        fill=tuple(fill) + (255,),
        outline=BORDER_RGB + (255,) if border else None,
        width=3 if border else 0,
    )

    art = keyed_art(src)
    pad = int(pad_in * dpi)
    art.thumbnail((w - 2 * pad, h - 2 * pad), Image.LANCZOS)
    canvas.alpha_composite(art, ((w - art.width) // 2, (h - art.height) // 2))
    canvas.save(dst)
    return dst


def as_png(src: Path) -> Path:
    """python-pptx cannot embed .webp, and every brand asset is webp."""
    from PIL import Image

    CACHE.mkdir(exist_ok=True)
    dst = CACHE / (src.stem.replace(" ", "-") + ".png")
    if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
        Image.open(src).save(dst)
    return dst


# --------------------------------------------------------------------------- #
# small shape helpers
# --------------------------------------------------------------------------- #

def _runs(shape):
    if not shape.has_text_frame:
        return
    for para in shape.text_frame.paragraphs:
        yield from para.runs


def _recolour(run, colour):
    try:
        run.font.color.rgb = colour
    except (AttributeError, TypeError, ValueError):
        pass


def _is_black(run) -> bool:
    try:
        return run.font.color.rgb == BLACK
    except (AttributeError, TypeError, ValueError):
        return False


def _drop(shape) -> None:
    el = shape._element
    el.getparent().remove(el)


def _place(shape, *, left=None, top=None, width=None, height=None) -> None:
    """Move a placeholder, writing the whole transform.

    A placeholder with no `a:xfrm` of its own inherits all four values from the
    layout. Setting one of them makes python-pptx create the element with only
    that value filled in, and the shape then renders at x=0 with an undefined
    size — so every reposition has to write the complete box.
    """
    box = (shape.left, shape.top, shape.width, shape.height)
    shape.left = box[0] if left is None else left
    shape.top = box[1] if top is None else top
    shape.width = box[2] if width is None else width
    shape.height = box[3] if height is None else height


def _textbox(slide, left, top, width, height, text, *, size, colour, font,
             bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
             spacing=1.0):
    box = slide.shapes.add_textbox(left, top, width, height)
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    for i, line in enumerate(text.split("\n")):
        para = frame.paragraphs[0] if i == 0 else frame.add_paragraph()
        para.alignment = align
        para.line_spacing = spacing
        run = para.add_run()
        run.text = line
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.name = font
        run.font.color.rgb = colour
    return box


# --------------------------------------------------------------------------- #
# colour passes over what the generator hardcodes
# --------------------------------------------------------------------------- #

def brand_text(prs) -> int:
    """Warm the generator's pure-black body copy to the brand text colour."""
    touched = 0
    for slide in prs.slides:
        for shape in slide.shapes:
            for run in _runs(shape):
                if _is_black(run):
                    _recolour(run, TEXT_MAIN)
                    touched += 1
    return touched


COLUMN_HEADER = re.compile(r"^(?:\d+\.\s+)?\S")


def brand_column_headers(prs) -> int:
    """Column headers carry the accent; the deck reads as plum + ivory.

    The generator emits them as ordinary body text in the same colour as the
    bullets under them, which flattens every framework slide into one grey block.
    Numbered (`1. Reflect`) and unnumbered (`Akademik`) headers both occur,
    depending on whether the layout is a process or a card grid.
    """
    touched = 0
    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_text_frame or not shape.is_placeholder:
                continue
            if shape.placeholder_format.type != PP_PLACEHOLDER.BODY:
                continue
            paragraphs = shape.text_frame.paragraphs
            if not paragraphs or not paragraphs[0].runs:
                continue
            if not COLUMN_HEADER.match(paragraphs[0].text.strip()):
                continue
            for run in paragraphs[0].runs:
                _recolour(run, PLUM)
                run.font.bold = True
                run.font.name = HEADER_FONT
                touched += 1
    return touched


def brand_fills(prs) -> int:
    """Black rule shapes become peach hairlines instead of hard bars."""
    touched = 0
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.is_placeholder or shape.has_table:
                continue
            try:
                fill = shape.fill
                if fill.type is not None and fill.fore_color.rgb == BLACK:
                    fill.fore_color.rgb = PEACH
                    touched += 1
            except (AttributeError, TypeError, ValueError):
                continue
    return touched


def brand_tables(prs) -> int:
    """Restyle the generator's table: plum header, readable body, banded rows.

    It ships a solid-black header row and 8pt body type sized for a table half
    this wide, which on a 13-inch slide is unreadable from the back of a room.
    """
    touched = 0
    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_table:
                continue
            table = shape.table
            if len(table.columns) == 2:
                table.columns[0].width = Emu(int(shape.width * 0.24))
                table.columns[1].width = Emu(shape.width - table.columns[0].width)

            for index, row in enumerate(table.rows):
                header = index == 0
                row.height = Inches(0.62 if header else 0.55)
                for cell in row.cells:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = (
                        PLUM if header else (WHITE if index % 2 else IVORY)
                    )
                    cell.margin_left = cell.margin_right = Inches(0.18)
                    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                    for para in cell.text_frame.paragraphs:
                        for run in para.runs:
                            run.font.size = Pt(12.5 if header else 11.5)
                            run.font.name = HEADER_FONT if header else BODY_FONT
                            _recolour(run, IVORY if header else TEXT_MAIN)
                    touched += 1
    return touched


# --------------------------------------------------------------------------- #
# restoring what the layouts drop
# --------------------------------------------------------------------------- #

def parse_blueprint() -> dict[int, dict]:
    """Slide number -> headline, supporting copy and full content bullets.

    The blueprint carries more per slide than any single layout can hold; the
    surplus becomes speaker notes so nothing the author wrote is lost.
    """
    if not BLUEPRINT.exists():
        return {}

    slides: dict[int, dict] = {}
    number, section = None, None
    for line in BLUEPRINT.read_text(encoding="utf-8").splitlines():
        head = re.match(r"^#\s+Slide\s+(\d+)", line)
        if head:
            number = int(head.group(1))
            slides[number] = {"headline": "", "support": "", "content": []}
            section = None
            continue
        if number is None:
            continue
        sub = re.match(r"^###\s+(.+)", line)
        if sub:
            section = sub.group(1).strip().lower()
            continue
        text = line.strip()
        if not text or text == "---":
            continue
        if section == "headline" and not slides[number]["headline"]:
            slides[number]["headline"] = _plain(text)
        elif section == "supporting copy" and not slides[number]["support"]:
            slides[number]["support"] = _plain(text)
        elif section == "content":
            slides[number]["content"].append(_plain(text))
    return slides


def _plain(text: str) -> str:
    """Strip the blueprint's markdown emphasis and list markers."""
    text = re.sub(r"^[-*]\s+", "", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return text.strip()


def _title_shape(slide):
    for shape in slide.shapes:
        if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.TITLE:
            return shape
    return None


def add_headlines(prs, blueprint) -> int:
    """Put the outline headline back on the grid and table layouts.

    `column-N-centered` gets a headline text box from the generator; the grid
    and `title-centered` table layouts do not, so those slides arrive with a
    section label and nothing that states the point.
    """
    added = 0
    for index, slide in enumerate(prs.slides, start=1):
        meta = blueprint.get(index)
        if not meta or not meta["headline"] or index == CLOSING_SLIDE:
            continue
        if _title_shape(slide) is None:
            continue
        existing = " ".join(
            s.text_frame.text for s in slide.shapes if s.has_text_frame
        )
        stem = meta["headline"].split(".")[0][:28]
        if stem and stem in existing:
            continue

        _textbox(
            slide, Inches(0.25), HEADLINE_BAND_TOP,
            prs.slide_width - Inches(0.5), HEADLINE_BAND_HEIGHT,
            meta["headline"],
            size=15, colour=TEXT_MAIN, font=HEADER_FONT, bold=True,
            anchor=MSO_ANCHOR.MIDDLE,
        )
        added += 1
    return added


def make_room_for_headlines(prs) -> None:
    """Slide the table down so the restored headline is not sitting on it."""
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_table and shape.top < ART_TOP_ON_GRID:
                delta = ART_TOP_ON_GRID - shape.top
                shape.top = Emu(shape.top + delta)
                shape.height = Emu(max(Inches(1), shape.height - delta))


def fill_pictures(prs) -> int:
    """Fill every picture placeholder with the app illustration for that topic.

    `insert_picture` centre-crops to the placeholder's aspect, which slices the
    mascot's head off, so the art is matted onto a card sized to the placeholder
    and the placeholder itself is removed.
    """
    placed = 0
    for index, slide in enumerate(prs.slides, start=1):
        assets = ART.get(index)
        if not assets:
            continue
        boxes = sorted(
            (s for s in slide.shapes
             if s.is_placeholder
             and s.placeholder_format.type == PP_PLACEHOLDER.PICTURE),
            key=lambda s: s.left,
        )
        grid = len(boxes) > 1
        for box, rel in zip(boxes, assets):
            src = REPO / rel
            if not src.exists():
                continue
            left, top, width, height = box.left, box.top, box.width, box.height
            if grid and top < ART_TOP_ON_GRID:
                height = Emu(height - (ART_TOP_ON_GRID - top))
                top = ART_TOP_ON_GRID
            # The full-height panels beside a bullet list would blow a single
            # 3D icon up past life size; hold them to a portrait-ish card.
            if not grid:
                height = Emu(min(height, Inches(5.4)))
                top = Emu(top + Inches(0.55))
            # A 5.8in-wide, 2.7in-tall card holds a height-bound icon with two
            # inches of empty surface either side; pull it back towards square.
            if width > height * 1.7:
                squared = Emu(int(height * 1.55))
                left = Emu(left + (width - squared) // 2)
                width = squared

            png = card_png(
                src, Emu(width).inches, Emu(height).inches,
                pad_in=0.55 if not grid else 0.34,
                radius_in=0.24 if not grid else 0.18,
            )
            slide.shapes.add_picture(str(png), left=left, top=top,
                                     width=width, height=height)
            _drop(box)
            placed += 1

        # Any placeholder we had no asset for would render as a blank hole.
        for leftover in boxes[len(assets):]:
            _drop(leftover)
    return placed


def add_notes(prs, blueprint) -> int:
    """Park the blueprint's full content list in the speaker notes."""
    added = 0
    for index, slide in enumerate(prs.slides, start=1):
        meta = blueprint.get(index)
        if not meta:
            continue
        lines = []
        if meta["support"]:
            lines.append(meta["support"])
            lines.append("")
        lines.extend(f"• {item}" for item in meta["content"])
        if not lines:
            continue
        slide.notes_slide.notes_text_frame.text = "\n".join(lines)
        added += 1
    return added


# --------------------------------------------------------------------------- #
# bespoke slides
# --------------------------------------------------------------------------- #

def _retarget_layout(slide, layout) -> None:
    """Point a slide at a different layout than the generator chose."""
    part = slide.part
    for rid, rel in list(part.rels.items()):
        if rel.reltype == RT.SLIDE_LAYOUT:
            part.drop_rel(rid)
    part.relate_to(layout.part, RT.SLIDE_LAYOUT)


def build_cover(prs) -> None:
    """Lay the cover out from the text the generator placed.

    `title-cover` is a five-box wireframe drawn by the layout itself, so its
    hairlines survive whatever is done to the slide, and it splits the identity
    line away from the title. The blueprint asks for one calm ivory field — logo,
    title, rule, credits, Pijar on the right — so the slide is re-pointed at the
    undecorated `title-centered` layout and the text is re-set here.
    """
    slide = prs.slides[0]
    blocks: list[list[str]] = []
    for shape in list(slide.shapes):
        if not shape.is_placeholder:
            continue
        text = shape.text_frame.text.strip() if shape.has_text_frame else ""
        if text:
            blocks.append([p.strip() for p in text.split("\n") if p.strip()])
        _drop(shape)

    _retarget_layout(slide, prs.slide_layouts[COVER_LAYOUT])

    # The `##` title and `###` tagline land in one placeholder; every other
    # placeholder holds a single credit line, in no reliable order.
    heading = next((b for b in blocks if len(b) > 1), ["RuangPijar", ""])
    title, tagline = heading[0], heading[1]
    credits = [b[0] for b in blocks if b is not heading]
    credits.sort(key=lambda line: 0 if line.startswith("MindCraft") else 1)

    left = Inches(0.95)
    logo = REPO / "public" / "ruang_pijar_logo.webp"
    if logo.exists():
        slide.shapes.add_picture(str(as_png(logo)), left=left,
                                 top=Inches(1.15), height=Inches(1.05))

    _textbox(slide, left, Inches(2.55), Inches(7.2), Inches(1.0), title,
             size=54, colour=PLUM, font=HEADER_FONT, bold=True, spacing=0.95)
    _textbox(slide, left, Inches(3.55), Inches(7.2), Inches(0.7), tagline,
             size=25, colour=TEXT_MAIN, font=HEADER_FONT, spacing=1.0)

    rule = slide.shapes.add_shape(1, left, Inches(4.45), Inches(3.2), Emu(19050))
    rule.fill.solid()
    rule.fill.fore_color.rgb = PEACH
    rule.line.fill.background()
    rule.shadow.inherit = False

    if credits:
        _textbox(slide, left, Inches(4.72), Inches(6.3), Inches(1.2),
                 "\n".join(credits), size=12.5, colour=TEXT_MUTED,
                 font=BODY_FONT, spacing=1.35)

    _textbox(slide, left, Inches(6.05), Inches(7.0), Inches(0.45),
             "Reflect  →  Record  →  Understand  →  Act",
             size=13, colour=PLUM, font=HEADER_FONT, bold=True)

    mascot = REPO / "public" / "maskot-pijar" / "Hero.webp"
    if mascot.exists():
        w, h = Inches(4.9), Inches(4.9)
        png = card_png(mascot, Emu(w).inches, Emu(h).inches,
                       pad_in=0.45, radius_in=0.34)
        slide.shapes.add_picture(str(png), left=Emu(prs.slide_width - w - Inches(0.9)),
                                 top=Inches(1.3), width=w, height=h)


def cutout_png(src: Path, height_in: float) -> Path:
    """The artwork alone, no card — for placing on the plum closing field."""
    from PIL import Image

    CACHE.mkdir(exist_ok=True)
    dst = CACHE / f"{src.stem.replace(' ', '-')}-cut{int(height_in * 100)}.png"
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return dst
    art = keyed_art(src)
    side = int(height_in * 200)
    art.thumbnail((side, side), Image.LANCZOS)
    art.save(dst)
    return dst


def decorate_design_slide(prs) -> None:
    """Show the design system on the UI/UX slide instead of only describing it.

    The blueprint asks for a palette strip and the type pairing as evidence; the
    columns are pulled up to open the band for it.
    """
    slide = prs.slides[DESIGN_SLIDE - 1]
    strip_top = Inches(6.25)

    for shape in slide.shapes:
        if (shape.is_placeholder
                and shape.placeholder_format.type == PP_PLACEHOLDER.BODY
                and shape.top + shape.height > strip_top):
            shape.text_frame.vertical_anchor = MSO_ANCHOR.TOP
            _place(shape, height=Emu(strip_top - shape.top - Inches(0.2)))

    left = Inches(0.30)
    size, gap = Inches(0.45), Inches(0.14)
    for index, (hexcode, label) in enumerate(SWATCHES):
        x = Emu(left + index * (size + gap))
        chip = slide.shapes.add_shape(5, x, strip_top, size, size)  # rounded rect
        chip.adjustments[0] = 0.22
        chip.fill.solid()
        chip.fill.fore_color.rgb = RGBColor.from_string(hexcode)
        chip.line.color.rgb = RGBColor.from_string(tpl.BORDER)
        chip.line.width = Pt(0.75)
        chip.shadow.inherit = False
        _textbox(slide, Emu(x - Inches(0.14)), Emu(strip_top + size + Inches(0.04)),
                 Emu(size + Inches(0.28)), Inches(0.3), label, size=10,
                 colour=TEXT_MUTED, font=BODY_FONT, align=PP_ALIGN.CENTER)

    type_left = Emu(left + len(SWATCHES) * (size + gap) + Inches(0.35))
    _textbox(slide, type_left, Emu(strip_top - Inches(0.06)), Inches(4.2),
             Inches(0.4), "Sora", size=19, colour=PLUM, font=HEADER_FONT,
             bold=True)
    _textbox(slide, type_left, Emu(strip_top + Inches(0.34)), Inches(4.2),
             Inches(0.35), "Plus Jakarta Sans  ·  tipografi produk",
             size=10.5, colour=TEXT_MUTED, font=BODY_FONT)

    mascot = REPO / "public" / "maskot-pijar" / "Hero.webp"
    if mascot.exists():
        height = Inches(1.3)
        slide.shapes.add_picture(
            str(cutout_png(mascot, Emu(height).inches)),
            left=Emu(prs.slide_width - height - Inches(0.6)),
            top=Emu(prs.slide_height - height - Inches(0.05)),
            height=height,
        )


def build_closing(prs) -> None:
    """Full-bleed plum with ivory type, as the blueprint specifies."""
    slide = prs.slides[CLOSING_SLIDE - 1]
    bg = slide.background
    bg.fill.solid()
    bg.fill.fore_color.rgb = PLUM

    for shape in slide.shapes:
        for run in _runs(shape):
            _recolour(run, IVORY)
        # The layout drops the statement in at title height; the blueprint wants
        # it centred, so the title and its supporting line move down together.
        if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.TITLE:
            _place(shape, top=Inches(2.15), height=Inches(1.7))
            for para in shape.text_frame.paragraphs:
                para.alignment = PP_ALIGN.CENTER
                for run in para.runs:
                    run.font.size = Pt(44)
                    run.font.name = HEADER_FONT

    _textbox(slide, Inches(0.95), Inches(6.25), Inches(8.0), Inches(0.8),
             "Terima kasih  ·  Tim CH  ·  MindCraft Web Competition 2026\n"
             "Kontak: [KONTAK TIM]",
             size=12.5, colour=IVORY, font=BODY_FONT, spacing=1.3)

    mascot = REPO / "public" / "maskot-pijar" / "Final CTA.webp"
    if mascot.exists():
        height = Inches(2.3)
        slide.shapes.add_picture(
            str(cutout_png(mascot, Emu(height).inches)),
            left=Emu(prs.slide_width - height - Inches(1.1)),
            top=Emu(prs.slide_height - height - Inches(0.55)),
            height=height,
        )


def main() -> None:
    tpl.main()

    generate = SKILL / "scripts" / "generate.py"
    subprocess.run(
        [
            sys.executable, str(generate), str(OUTLINE),
            "-o", str(OUTPUT),
            "--template", str(DECK / "ruangpijar-template.pptx"),
            "--config", str(DECK / "ruangpijar-template-config.json"),
        ],
        check=True,
        cwd=REPO,
    )

    blueprint = parse_blueprint()
    prs = Presentation(str(OUTPUT))

    runs = brand_text(prs)
    heads = brand_column_headers(prs)
    fills = brand_fills(prs)
    tables = brand_tables(prs)

    make_room_for_headlines(prs)
    lines = add_headlines(prs, blueprint)
    art = fill_pictures(prs)
    build_cover(prs)
    decorate_design_slide(prs)
    build_closing(prs)
    notes = add_notes(prs, blueprint)

    prs.save(str(OUTPUT))
    print(f"Brand pass: {runs} runs, {heads} column headers, {fills} fills, "
          f"{tables} table cells, {lines} headlines, {art} illustrations, "
          f"{notes} note pages")

    subprocess.run(
        [sys.executable, str(SKILL / "scripts" / "validate.py"), str(OUTPUT)],
        check=False,
        cwd=REPO,
    )


if __name__ == "__main__":
    main()
