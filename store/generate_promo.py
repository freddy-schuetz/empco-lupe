"""Generate Chrome Web Store promotional tile (440x280) + ZIP-ready check."""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.dirname(__file__)

W, H = 440, 280
SCALE = 4
sw, sh = W * SCALE, H * SCALE

CYAN = (0, 217, 255, 255)
CYAN_DARK = (0, 184, 212, 255)
CYAN_DEEP = (0, 110, 130, 255)
BG_TOP = (24, 24, 28, 255)        # #18181c
BG_BOTTOM = (5, 5, 8, 255)        # #050508
WHITE = (255, 255, 255, 255)
DIM = (160, 160, 160, 255)


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

# Dark vertical gradient bg
bg_px = img.load()
for y in range(sh):
    t = y / sh
    c = lerp(BG_TOP, BG_BOTTOM, t)
    for x in range(sw):
        bg_px[x, y] = c

# Cyan glow blob behind the lens area (left side)
glow = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((50 * SCALE, 30 * SCALE, 200 * SCALE, 250 * SCALE), fill=(0, 217, 255, 110))
glow = glow.filter(ImageFilter.GaussianBlur(radius=60))
img.alpha_composite(glow)

# Draw the Lupe icon (white BG variant, centered in left third)
lupe_size = 160 * SCALE
lupe_x = 40 * SCALE
lupe_y = (sh - lupe_size) // 2

# White rounded square
lupe_bg = Image.new("RGBA", (lupe_size, lupe_size), (248, 250, 252, 255))
lupe_mask = Image.new("L", (lupe_size, lupe_size), 0)
ImageDraw.Draw(lupe_mask).rounded_rectangle((0, 0, lupe_size - 1, lupe_size - 1), radius=lupe_size // 6, fill=255)
img.paste(lupe_bg, (lupe_x, lupe_y), lupe_mask)

# Lens + handle (proportional to lupe_size)
cx = lupe_x + int(lupe_size * 0.42)
cy = lupe_y + int(lupe_size * 0.42)
lens_r = int(lupe_size * 0.32)
ring_w = max(2, int(lupe_size * 0.11))

# Glass interior
GLASS_LIGHT = (210, 245, 252, 255)
glass_mask = Image.new("L", img.size, 0)
ImageDraw.Draw(glass_mask).ellipse(
    (cx - lens_r + ring_w, cy - lens_r + ring_w,
     cx + lens_r - ring_w, cy + lens_r - ring_w),
    fill=255,
)
glass_img = Image.new("RGBA", img.size, GLASS_LIGHT)
img.paste(glass_img, (0, 0), glass_mask)

# Ring with gradient
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
import math
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

# --- Text right of lupe ---
text_x = 220 * SCALE
text_y_start = 60 * SCALE
d = ImageDraw.Draw(img)

# Eyebrow
eyebrow_font = fit_font("EYE", 13 * SCALE)
d.text((text_x, text_y_start), "EMPCO · UWG", font=eyebrow_font, fill=CYAN)

# Title
title_font = fit_font("T", 32 * SCALE)
d.text((text_x, text_y_start + 22 * SCALE), "EmpCo-Lupe", font=title_font, fill=WHITE)

# Subtitle
sub_font = fit_font("S", 16 * SCALE)
d.text((text_x, text_y_start + 70 * SCALE), "Greenwashing-Check", font=sub_font, fill=CYAN)
d.text((text_x, text_y_start + 92 * SCALE), "fuer Tourismus-Sites", font=sub_font, fill=CYAN)

# Description
desc_font = fit_font("D", 12 * SCALE)
d.text((text_x, text_y_start + 130 * SCALE),
       "Side-Panel · Selektions-Check ·", font=desc_font, fill=DIM)
d.text((text_x, text_y_start + 148 * SCALE),
       "Per-Section DOM-Analyse", font=desc_font, fill=DIM)

# Friedemann attribution at bottom
attr_font = fit_font("A", 11 * SCALE)
d.text((text_x, sh - 35 * SCALE),
       "friedemann-schuetz.de · n8n Ambassador", font=attr_font, fill=(120, 120, 120, 255))

# Cyan accent bar (left)
ImageDraw.Draw(img).rectangle((0, 0, 4 * SCALE, sh), fill=CYAN)

# Final downsample
out = img.resize((W, H), Image.LANCZOS)
p = os.path.join(OUT, "promo-tile-440x280.png")
out.save(p, "PNG")
print(f"Wrote: {p}")
