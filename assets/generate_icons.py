"""generate_icons.py — render EmpCo-Lupe icons (16/32/48/128 px) + SVG.

Design v3 (Variant B): white rounded BG, dark-cyan lens with light glass + "E".
  - White (#f8fafc) rounded-square background, NO outer glow
  - Cyan-dark ring (#00B8D4 top -> deep cyan-blue bottom) for contrast on white
  - Light cyan glass interior (#d2f5fc)
  - Diagonal handle in matching gradient
  - "E" in deep cyan-blue, fitting the lens — visible at >=32 px
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT, exist_ok=True)

# Brand palette
BG_WHITE = (248, 250, 252, 255)   # #f8fafc
GLASS_LIGHT = (210, 245, 252, 255)  # #d2f5fc — very light cyan
CYAN_DARK = (0, 184, 212, 255)    # #00B8D4
CYAN_DEEP = (0, 110, 130, 255)    # darker cyan-blue for contrast
TEXT_E = (0, 110, 130, 255)       # E color = CYAN_DEEP

SIZES = [16, 32, 48, 128]
SCALE = 4   # supersample for AA


def fit_font(text, max_size):
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf", "segoeui.ttf"):
        try:
            return ImageFont.truetype(name, max_size)
        except Exception:
            continue
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def rounded_mask(width, height, radius):
    m = Image.new("L", (width, height), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, width - 1, height - 1), radius=radius, fill=255)
    return m


def circle_mask(size, cx, cy, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    return m


def make_icon(target_size: int) -> Image.Image:
    """Render at 4x size then downsample. Variant B: white BG + dark cyan lens + E."""
    s = target_size * SCALE
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))

    # --- 1. White rounded-square background ---
    bg = Image.new("RGBA", (s, s), BG_WHITE)
    corner = max(4, s // 6)
    img.paste(bg, (0, 0), rounded_mask(s, s, corner))

    # Lens geometry
    cx = int(s * 0.42)
    cy = int(s * 0.42)
    lens_r = int(s * 0.32)
    ring_w = max(2, int(s * 0.11))

    # --- 2. Light cyan glass interior ---
    glass = Image.new("RGBA", (s, s), GLASS_LIGHT)
    img.paste(glass, (0, 0), circle_mask((s, s), cx, cy, lens_r - ring_w // 2 - 1))

    # --- 3. Cyan-dark ring with vertical gradient (top -> bottom darker) ---
    ring_grad = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    rpx = ring_grad.load()
    for y in range(s):
        t = (y - (cy - lens_r)) / max(1, lens_r * 2)
        t = max(0.0, min(1.0, t))
        c = lerp(CYAN_DARK, CYAN_DEEP, t)
        for x in range(s):
            rpx[x, y] = c
    ring_mask = Image.new("L", (s, s), 0)
    rd = ImageDraw.Draw(ring_mask)
    rd.ellipse((cx - lens_r, cy - lens_r, cx + lens_r, cy + lens_r), fill=255)
    rd.ellipse(
        (cx - lens_r + ring_w, cy - lens_r + ring_w,
         cx + lens_r - ring_w, cy + lens_r - ring_w),
        fill=0,
    )
    img.paste(ring_grad, (0, 0), ring_mask)

    # --- 4. "E" in the lens (only at >=32 px, otherwise it muddies the icon) ---
    if target_size >= 32:
        e_size = int(lens_r * 1.0)
        font = fit_font("E", e_size)
        d = ImageDraw.Draw(img)
        bbox = d.textbbox((0, 0), "E", font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((cx - tw // 2 - bbox[0], cy - th // 2 - bbox[1]), "E", font=font, fill=TEXT_E)

    # --- 5. Diagonal handle (45° SE) with dark cyan outline + cyan-dark fill ---
    angle = math.radians(45)
    edge_x = int(cx + lens_r * math.cos(angle))
    edge_y = int(cy + lens_r * math.sin(angle))
    tip_x = int(s * 0.86)
    tip_y = int(s * 0.86)
    handle_w = max(3, int(s * 0.11))

    hlayer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hlayer)
    hd.line((edge_x, edge_y, tip_x, tip_y), fill=CYAN_DEEP, width=handle_w + max(2, s // 100))
    r2 = (handle_w + max(2, s // 100)) // 2
    hd.ellipse((edge_x - r2, edge_y - r2, edge_x + r2, edge_y + r2), fill=CYAN_DEEP)
    hd.ellipse((tip_x - r2, tip_y - r2, tip_x + r2, tip_y + r2), fill=CYAN_DEEP)
    hd.line((edge_x, edge_y, tip_x, tip_y), fill=CYAN_DARK, width=handle_w)
    r1 = handle_w // 2
    hd.ellipse((edge_x - r1, edge_y - r1, edge_x + r1, edge_y + r1), fill=CYAN_DARK)
    hd.ellipse((tip_x - r1, tip_y - r1, tip_x + r1, tip_y + r1), fill=CYAN_DARK)
    img.alpha_composite(hlayer)

    return img.resize((target_size, target_size), Image.LANCZOS)


for sz in SIZES:
    out = make_icon(sz)
    p = os.path.join(OUT, f"{sz}.png")
    out.save(p, "PNG")
    print(f"  wrote {p} ({sz}x{sz})")

# --- SVG source (Variant B) ---
SVG = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00B8D4"/>
      <stop offset="100%" stop-color="#006E82"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="22" fill="#f8fafc"/>
  <circle cx="54" cy="54" r="34" fill="#d2f5fc"/>
  <circle cx="54" cy="54" r="36" fill="none" stroke="url(#ring)" stroke-width="11"/>
  <text x="54" y="69" font-family="-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="44" font-weight="700"
        text-anchor="middle" fill="#006E82">E</text>
  <line x1="80" y1="80" x2="108" y2="108" stroke="#006E82" stroke-width="16" stroke-linecap="round"/>
  <line x1="80" y1="80" x2="108" y2="108" stroke="#00B8D4" stroke-width="12" stroke-linecap="round"/>
</svg>
"""
with open(os.path.join(OUT, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(SVG)
print(f"  wrote {OUT}/icon.svg")
print("Done.")
