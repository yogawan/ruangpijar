#!/usr/bin/env python3
"""Rebrand the pptx-from-layouts base template with the RuangPijar identity.

The pptx-from-layouts skill fills a template's real slide-master layouts, so the
deck's whole visual identity comes from the template — not from the outline and
not from the render config (which only carries fonts). This script takes the
bundled Inner Chapter template and swaps its theme colour scheme, font scheme
and master branding for the palette in `app/globals.css`.

Re-runnable: it always starts from the pristine base template.

    python deck/build_template.py
"""

from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DECK = REPO / "deck"
BASE = DECK / "pptx-from-layouts-skill" / "templates" / "inner-chapter.pptx"
OUT = DECK / "ruangpijar-template.pptx"

# Palette lifted from app/globals.css :root tokens.
IVORY = "FAF8F4"        # --background
WHITE = "FFFFFF"        # --surface
SURFACE_MUTED = "EEE5EC"
PEACH_SUBTLE = "F8E7DF"
SAGE = "8FA58D"
SAGE_SOFT = "E7EFE5"
TEXT_MAIN = "292525"
TEXT_MUTED = "746E6A"
PLUM = "5B3A52"         # --primary
PEACH = "E9A68D"        # --accent
BORDER = "E8E2DC"

HEADER_FONT = "Sora"
BODY_FONT = "Plus Jakarta Sans"

CLR_SCHEME = (
    '<a:clrScheme name="RuangPijar">'
    f'<a:dk1><a:srgbClr val="{TEXT_MAIN}"/></a:dk1>'
    f'<a:lt1><a:srgbClr val="{IVORY}"/></a:lt1>'
    f'<a:dk2><a:srgbClr val="{PLUM}"/></a:dk2>'
    f'<a:lt2><a:srgbClr val="{WHITE}"/></a:lt2>'
    f'<a:accent1><a:srgbClr val="{PLUM}"/></a:accent1>'
    f'<a:accent2><a:srgbClr val="{PEACH}"/></a:accent2>'
    f'<a:accent3><a:srgbClr val="{SAGE}"/></a:accent3>'
    f'<a:accent4><a:srgbClr val="{SURFACE_MUTED}"/></a:accent4>'
    f'<a:accent5><a:srgbClr val="{PEACH_SUBTLE}"/></a:accent5>'
    f'<a:accent6><a:srgbClr val="{TEXT_MUTED}"/></a:accent6>'
    f'<a:hlink><a:srgbClr val="{PLUM}"/></a:hlink>'
    f'<a:folHlink><a:srgbClr val="{TEXT_MUTED}"/></a:folHlink>'
    "</a:clrScheme>"
)


def rebrand_theme(xml: str) -> str:
    xml = re.sub(r"<a:clrScheme.*?</a:clrScheme>", CLR_SCHEME, xml, flags=re.S)
    xml = xml.replace('<a:fontScheme name="Aptos">', '<a:fontScheme name="RuangPijar">')
    # majorFont is the first latin typeface in the scheme, minorFont the second.
    xml = re.sub(
        r"(<a:majorFont><a:latin typeface=\")[^\"]+",
        r"\g<1>" + HEADER_FONT,
        xml,
    )
    xml = re.sub(
        r"(<a:minorFont><a:latin typeface=\")[^\"]+",
        r"\g<1>" + BODY_FONT,
        xml,
    )
    return xml


def rebrand_master(xml: str) -> str:
    # Titles carry the brand colour; body text stays warm near-black.
    xml = xml.replace(
        '<a:defRPr sz="2400" b="0" i="0" kern="1200" baseline="0">'
        '<a:solidFill><a:schemeClr val="tx1"/></a:solidFill>',
        '<a:defRPr sz="2400" b="0" i="0" kern="1200" baseline="0">'
        '<a:solidFill><a:schemeClr val="accent1"/></a:solidFill>',
    )
    xml = xml.replace("INNER CHAPTER ", "RUANGPIJAR ")
    return _swap_fonts(soften_outlines(xml))


def _swap_fonts(xml: str) -> str:
    """Replace the template's hardcoded Aptos references with the brand fonts.

    Title placeholders keep the display face; everything else takes the body
    face. Detecting "this is a title" from the raw XML is unreliable, so the
    title style is handled by its distinctive sz="2400" run properties above and
    the rest fall through to the body font.
    """
    return xml.replace('typeface="Aptos"', f'typeface="{BODY_FONT}"')


HAIRLINE = re.compile(
    r"(<a:ln\b[^>]*>)<a:solidFill>.*?</a:solidFill>",
    re.S,
)


def soften_outlines(xml: str) -> str:
    """Recolour shape outlines to the border token.

    The base template draws its structure with near-black hairlines derived from
    `tx1`. On a white ground that reads as editorial; on ivory it reads as an
    unfinished wireframe. Swapping them for --border-glass keeps the structure
    without the boxed-in look.
    """
    return HAIRLINE.sub(
        r"\g<1>" + f'<a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill>',
        xml,
    )


def rebrand_layout(xml: str) -> str:
    return _swap_fonts(soften_outlines(xml))


def main() -> None:
    if not BASE.exists():
        raise SystemExit(f"base template not found: {BASE}")
    OUT.parent.mkdir(parents=True, exist_ok=True)

    tmp = OUT.with_suffix(".tmp.pptx")
    shutil.copy(BASE, tmp)

    with zipfile.ZipFile(tmp) as zin:
        items = [(i, zin.read(i.filename)) for i in zin.infolist()]

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zout:
        for info, data in items:
            name = info.filename
            if name == "ppt/theme/theme1.xml":
                data = rebrand_theme(data.decode("utf-8")).encode("utf-8")
            elif name.startswith("ppt/slideMasters/") and name.endswith(".xml"):
                data = rebrand_master(data.decode("utf-8")).encode("utf-8")
            elif name.startswith("ppt/slideLayouts/") and name.endswith(".xml"):
                data = rebrand_layout(data.decode("utf-8")).encode("utf-8")
            zout.writestr(info, data)

    tmp.unlink()
    print(f"Wrote {OUT.relative_to(REPO)}")


if __name__ == "__main__":
    main()
