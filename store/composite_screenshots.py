"""composite_screenshots.py — turn portrait Side-Panel snips into landscape
   1280x800 marketing-style screenshots for the Chrome Web Store.

For each PNG in store/screenshots-raw/, render a 1280x800 frame:
  - dark brand-gradient background
  - subtle cyan glow on the left
  - the original portrait Side-Panel snip placed LEFT, scaled to ~700px tall,
    with rounded corners + drop-shadow
  - RIGHT: big headline + subtitle (configurable per file) + footer attribution
  - cyan accent bar at top

If the input is already landscape (~16:10), it's just letterboxed onto white.
"""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "screenshots-raw")
DST = os.path.join(HERE, "screenshots")
os.makedirs(DST, exist_ok=True)

W, H = 1280, 800

# Brand palette
BG_TOP = (24, 24, 28, 255)
BG_BOTTOM = (5, 5, 10, 255)
CYAN = (0, 217, 255, 255)
CYAN_DARK = (0, 184, 212, 255)
WHITE = (255, 255, 255, 255)
DIM = (170, 175, 185, 255)
FOOTER = (110, 115, 125, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def fit_font(text, size):
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf", "segoeui.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def rounded_corners(im, r):
    """Return im with rounded corners (transparent outside)."""
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), radius=r, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def drop_shadow(im, blur=20, offset=(0, 8), color=(0, 0, 0, 130)):
    w, h = im.size
    pad = blur * 2 + max(abs(offset[0]), abs(offset[1]))
    sh = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    # Use im's alpha to define shadow shape
    alpha = im.split()[3] if im.mode == "RGBA" else None
    if alpha is None:
        return im
    shadow_layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    block = Image.new("RGBA", im.size, color)
    block.putalpha(alpha)
    shadow_layer.paste(block, (pad + offset[0], pad + offset[1]))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=blur))
    shadow_layer.paste(im, (pad, pad), im)
    return shadow_layer


def brand_bg():
    img = Image.new("RGBA", (W, H), BG_TOP)
    px = img.load()
    for y in range(H):
        t = y / H
        c = lerp(BG_TOP, BG_BOTTOM, t)
        for x in range(W):
            px[x, y] = c
    # cyan glow blob on left side
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((-50, 100, 400, 700), fill=(0, 217, 255, 95))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    img.alpha_composite(glow)
    # cyan accent bar at top
    ImageDraw.Draw(img).rectangle((0, 0, W, 4), fill=CYAN)
    return img


# Per-screenshot copy. Match the order of files alphabetically (matches the
# naming Friedemann used: Screenshot_1_..., Screenshot_2_..., ...).
# Filename-keyword -> headline+subtitle mapping. Robust to typos like
# "Highligts" because we substring-match the first hit.
COPY_BY_KEYWORD = [
    (("findings", "sidepanel", "side_panel", "panel"),
     {"headline": "Findings auf\neinen Blick",
      "subtitle": "Pro Aussage Severity-Badge, verbatim-Citation\naus EU-EmpCo und drei Umformulierungs-Alternativen."}),
    (("highlight", "highligt", "marker"),
     {"headline": "Triggerwörter\nsofort markiert",
      "subtitle": 'Auto-Hervorhebung von "nachhaltig", "klimaneutral", "öko"\ndirekt im DOM — offline, ohne API-Call.'}),
    (("select", "selektion", "kontext", "context", "rechtsklick", "rightclick"),
     {"headline": "Selektions-Check\nper Rechtsklick",
      "subtitle": 'Markier einen Satz, "EmpCo prüfen" — und in\nSekunden hast du die Bewertung im Side-Panel.'}),
    (("beleg", "citation", "quelle", "alternative"),
     {"headline": "Belegstellen aus\nEU-Originaltext",
      "subtitle": "Jede Bewertung mit verbatim-Citation aus EmpCo-Richtlinie,\nUWG oder anerkannten Drittzertifikaten. Verifiziert, nicht halluziniert."}),
    (("setting", "einstellung", "config", "history", "verlauf"),
     {"headline": "Konfigurierbar\n& privat",
      "subtitle": "Sektor-Hinweis, Skip-Liste, Telemetrie-Opt-In.\nKlartext-URLs verlassen deinen Browser nie."}),
]
DEFAULT_COPY = COPY_BY_KEYWORD[0][1]


def copy_for(filename: str):
    lower = filename.lower()
    for keywords, copy in COPY_BY_KEYWORD:
        for kw in keywords:
            if kw in lower:
                return copy
    return DEFAULT_COPY

FOOTER_TEXT = "EmpCo-Lupe  ·  Side-Project von Friedemann Schütz  ·  friedemann-schuetz.de"


def compose(snip_path: str, out_path: str):
    snip = Image.open(snip_path).convert("RGBA")
    w, h = snip.size
    is_portrait = h >= w  # treat square-ish + portrait the same way

    bg = brand_bg()

    if not is_portrait:
        # Already landscape -> center-fit + dark frame
        target_w = W - 80
        target_h = H - 80
        ratio = min(target_w / w, target_h / h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        scaled = snip.resize((new_w, new_h), Image.LANCZOS)
        scaled = rounded_corners(scaled, 12)
        shadow = drop_shadow(scaled, blur=18, offset=(0, 10))
        ox = (W - shadow.size[0]) // 2
        oy = (H - shadow.size[1]) // 2
        bg.alpha_composite(shadow, (ox, oy))
    else:
        # Portrait: scale to ~700 tall on the LEFT
        target_h = 700
        ratio = target_h / h
        new_w, new_h = max(1, int(w * ratio)), target_h
        # Cap width so it doesn't take more than ~55% of canvas
        if new_w > 540:
            new_w = 540
            ratio = new_w / w
            new_h = int(h * ratio)
        scaled = snip.resize((new_w, new_h), Image.LANCZOS)
        scaled = rounded_corners(scaled, 14)
        shadow = drop_shadow(scaled, blur=20, offset=(0, 12))
        # Position shadow on left, vertically centered
        ox = 60 - 40  # account for shadow padding
        oy = (H - shadow.size[1]) // 2
        bg.alpha_composite(shadow, (ox, oy))

        # --- Right column: headline + subtitle ---
        text_x = max(640, ox + shadow.size[0] - 20)
        # Headline (chosen by filename keyword)
        copy = copy_for(os.path.basename(snip_path))
        head_font = fit_font("H", 56)
        sub_font = fit_font("S", 21)
        d = ImageDraw.Draw(bg)
        # multi-line headline
        head_y = 180
        for line in copy["headline"].split("\n"):
            d.text((text_x, head_y), line, font=head_font, fill=WHITE)
            head_y += 64
        # gap + cyan rule
        rule_y = head_y + 12
        d.rectangle((text_x, rule_y, text_x + 60, rule_y + 4), fill=CYAN)
        # subtitle
        sub_y = rule_y + 28
        for line in copy["subtitle"].split("\n"):
            d.text((text_x, sub_y), line, font=sub_font, fill=DIM)
            sub_y += 32

    # Footer attribution
    fd = ImageDraw.Draw(bg)
    foot_font = fit_font("F", 15)
    bbox = fd.textbbox((0, 0), FOOTER_TEXT, font=foot_font)
    fd.text((W - (bbox[2] - bbox[0]) - 30, H - 30), FOOTER_TEXT, font=foot_font, fill=FOOTER)

    # Drop alpha (Chrome Web Store: no alpha)
    flat = Image.new("RGB", bg.size, (0, 0, 0))
    flat.paste(bg, mask=bg.split()[3])
    flat.save(out_path, "PNG")
    print(f"  {os.path.basename(snip_path)} -> {os.path.basename(out_path)}  ({'portrait+composite' if is_portrait else 'landscape+letterbox'})")


files = sorted([f for f in os.listdir(SRC) if f.lower().endswith((".png", ".jpg", ".jpeg"))])
if not files:
    print(f"No screenshots in {SRC}.")
else:
    for i, fn in enumerate(files, 1):
        compose(os.path.join(SRC, fn), os.path.join(DST, f"screenshot-{i:02d}.png"))
    print(f"\nDone. {len(files)} composites in {DST}/")
