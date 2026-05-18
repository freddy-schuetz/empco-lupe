"""Generate Chrome Web Store marquee promotional tile (1400x560)."""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.dirname(__file__)

W, H = 1400, 560
SCALE = 2
sw, sh = W * SCALE, H * SCALE

CYAN = (0, 217, 255, 255)
CYAN_DARK = (0, 184, 212, 255)
CYAN_DEEP = (0, 110, 130, 255)
BG_TOP = (24, 24, 28, 255)
BG_BOTTOM = (5, 5, 8, 255)
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


img = Image.new("RGBA", (sw, sh), BG_TOP)
# Vertical bg gradient
bg_px = img.load()
for y in range(sh):
    t = y / sh
    c = lerp(BG_TOP, BG_BOTTOM, t)
    for x in range(sw):
        bg_px[x, y] = c

# Cyan glow blob (left)
glow = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((-100 * SCALE, 50 * SCALE, 500 * SCALE, 510 * SCALE), fill=(0, 217, 255, 100))
glow = glow.filter(ImageFilter.GaussianBlur(radius=110))
img.alpha_composite(glow)

# Top cyan accent bar
ImageDraw.Draw(img).rectangle((0, 0, sw, 6 * SCALE), fill=CYAN)

# --- Lupe icon (Variant B, scaled up) — left ---
lupe_size = 300 * SCALE
lupe_x = 90 * SCALE
lupe_y = (sh - lupe_size) // 2

lupe_bg = Image.new("RGBA", (lupe_size, lupe_size), (248, 250, 252, 255))
lupe_mask = Image.new("L", (lupe_size, lupe_size), 0)
ImageDraw.Draw(lupe_mask).rounded_rectangle((0, 0, lupe_size - 1, lupe_size - 1), radius=lupe_size // 6, fill=255)
img.paste(lupe_bg, (lupe_x, lupe_y), lupe_mask)

cx = lupe_x + int(lupe_size * 0.42)
cy = lupe_y + int(lupe_size * 0.42)
lens_r = int(lupe_size * 0.32)
ring_w = max(2, int(lupe_size * 0.11))

# Glass
GLASS_LIGHT = (210, 245, 252, 255)
glass_mask = Image.new("L", img.size, 0)
ImageDraw.Draw(glass_mask).ellipse(
    (cx - lens_r + ring_w, cy - lens_r + ring_w,
     cx + lens_r - ring_w, cy + lens_r - ring_w),
    fill=255,
)
img.paste(Image.new("RGBA", img.size, GLASS_LIGHT), (0, 0), glass_mask)

# Ring gradient
ring_grad = Image.new("RGBA", img.size, (0, 0, 0, 0))
rpx = ring_grad.load()
for y in range(sh):
    t = (y - (cy - lens_r)) / max(1, lens_r * 2)
    t = max(0.0, min(1.0, t))
    c = lerp(CYAN_DARK, CYAN_DEEP, t)
    for x in range(sw):
        rpx[x, y] = c
ring_mask = Image.new("L", img.size, 0)
rd = ImageDraw.Draw(ring_mask)
rd.ellipse((cx - lens_r, cy - lens_r, cx + lens_r, cy + lens_r), fill=255)
rd.ellipse(
    (cx - lens_r + ring_w, cy - lens_r + ring_w,
     cx + lens_r - ring_w, cy + lens_r - ring_w),
    fill=0,
)
img.paste(ring_grad, (0, 0), ring_mask)

# E in lens
e_font = fit_font("E", int(lens_r * 1.0))
d = ImageDraw.Draw(img)
bb = d.textbbox((0, 0), "E", font=e_font)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
d.text((cx - tw // 2 - bb[0], cy - th // 2 - bb[1]), "E", font=e_font, fill=CYAN_DEEP)

# Handle
angle = math.radians(45)
ex = int(cx + lens_r * math.cos(angle))
ey = int(cy + lens_r * math.sin(angle))
tx = lupe_x + int(lupe_size * 0.86)
ty = lupe_y + int(lupe_size * 0.86)
hw = max(3, int(lupe_size * 0.11))
hlayer = Image.new("RGBA", img.size, (0, 0, 0, 0))
hd = ImageDraw.Draw(hlayer)
hd.line((ex, ey, tx, ty), fill=CYAN_DEEP, width=hw + 6)
r2 = (hw + 6) // 2
hd.ellipse((ex - r2, ey - r2, ex + r2, ey + r2), fill=CYAN_DEEP)
hd.ellipse((tx - r2, ty - r2, tx + r2, ty + r2), fill=CYAN_DEEP)
hd.line((ex, ey, tx, ty), fill=CYAN_DARK, width=hw)
r1 = hw // 2
hd.ellipse((ex - r1, ey - r1, ex + r1, ey + r1), fill=CYAN_DARK)
hd.ellipse((tx - r1, ty - r1, tx + r1, ty + r1), fill=CYAN_DARK)
img.alpha_composite(hlayer)

# --- Right side: big marketing copy ---
text_x = 520 * SCALE
d = ImageDraw.Draw(img)

# Eyebrow
eyebrow_font = fit_font("E", 18 * SCALE)
d.text((text_x, 110 * SCALE), "EMPCO  ·  UWG  ·  TOURISMUS", font=eyebrow_font, fill=CYAN)

# Big title
title_font = fit_font("T", 76 * SCALE)
d.text((text_x, 145 * SCALE), "EmpCo-Lupe", font=title_font, fill=WHITE)

# Cyan rule
d.rectangle((text_x, 245 * SCALE, text_x + 80 * SCALE, 250 * SCALE), fill=CYAN)

# Sub-headline
sub_font = fit_font("S", 30 * SCALE)
d.text((text_x, 275 * SCALE), "Greenwashing-Check", font=sub_font, fill=CYAN)
d.text((text_x, 315 * SCALE), "für Tourismus-Marketing-Texte", font=sub_font, fill=DIM)

# Feature bullets
bullet_font = fit_font("B", 17 * SCALE)
bullets = [
    "Prüfung nach EU-EmpCo-Richtlinie 2024/825 + UWG",
    "DOM-aware: Hero, Body und Nav unterscheiden",
    "Verifizierte Belegstellen aus EU-Originaltext",
]
for i, b in enumerate(bullets):
    d.text((text_x, (380 + i * 28) * SCALE), "•  " + b, font=bullet_font, fill=DIM)

# Footer
foot_font = fit_font("F", 15 * SCALE)
foot_text = "Side-Project von Friedemann Schütz  ·  friedemann-schuetz.de  ·  n8n Ambassador"
bbox = d.textbbox((0, 0), foot_text, font=foot_font)
d.text((sw - (bbox[2] - bbox[0]) - 60 * SCALE, sh - 40 * SCALE), foot_text, font=foot_font, fill=FOOTER)

# Downsample + drop alpha
out = img.resize((W, H), Image.LANCZOS)
flat = Image.new("RGB", out.size, (0, 0, 0))
flat.paste(out, mask=out.split()[3])
p = os.path.join(OUT, "marquee-1400x560.png")
flat.save(p, "PNG")
print(f"Wrote: {p}")
