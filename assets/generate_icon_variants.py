"""Render 3 icon variants at 128 px for comparison."""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "variants")
os.makedirs(OUT, exist_ok=True)

CYAN = (0, 217, 255, 255)
CYAN_DARK = (0, 184, 212, 255)
CYAN_DEEP = (0, 110, 130, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    return m


def fit_font(text, max_size):
    """Largest TTF font that still fits the lens. Falls back to default."""
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf", "segoeui.ttf"):
        try:
            return ImageFont.truetype(name, max_size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_lens_and_handle(img, cx, cy, lens_r, ring_w, ring_top, ring_bot, handle_top, handle_bot, glow_color=None, glow_radius=0):
    s = img.size[0]
    if glow_color and glow_radius > 0:
        gl = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).ellipse(
            (cx - lens_r - ring_w, cy - lens_r - ring_w,
             cx + lens_r + ring_w, cy + lens_r + ring_w),
            fill=glow_color,
        )
        gl = gl.filter(ImageFilter.GaussianBlur(radius=glow_radius))
        img.alpha_composite(gl)

    # Ring gradient via mask
    ring_grad = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rpx = ring_grad.load()
    for y in range(s):
        t = (y - (cy - lens_r)) / max(1, lens_r * 2)
        t = max(0.0, min(1.0, t))
        c = lerp(ring_top, ring_bot, t)
        for x in range(s):
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

    # Diagonal handle (45° SE)
    angle = math.radians(45)
    ex = int(cx + lens_r * math.cos(angle))
    ey = int(cy + lens_r * math.sin(angle))
    tx = int(s * 0.86)
    ty = int(s * 0.86)
    hw = max(3, int(s * 0.11))
    hl = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    # Outline
    hd.line((ex, ey, tx, ty), fill=handle_bot, width=hw + max(2, s // 100))
    r2 = (hw + max(2, s // 100)) // 2
    hd.ellipse((ex - r2, ey - r2, ex + r2, ey + r2), fill=handle_bot)
    hd.ellipse((tx - r2, ty - r2, tx + r2, ty + r2), fill=handle_bot)
    # Bright top
    hd.line((ex, ey, tx, ty), fill=handle_top, width=hw)
    r1 = hw // 2
    hd.ellipse((ex - r1, ey - r1, ex + r1, ey + r1), fill=handle_top)
    hd.ellipse((tx - r1, ty - r1, tx + r1, ty + r1), fill=handle_top)
    img.alpha_composite(hl)


def draw_E(img, cx, cy, color, max_height_px):
    s = img.size[0]
    font = fit_font("E", max_height_px)
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0, 0), "E", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw // 2 - bbox[0], cy - th // 2 - bbox[1]), "E", font=font, fill=color)


# ----------------------------------------------------------------------------
# VARIANT A — TRANSPARENT background, no dark square at all
# Just the lens floats; works on any toolbar background
# ----------------------------------------------------------------------------
def variant_A(size=128, scale=4):
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    cx, cy = int(s * 0.42), int(s * 0.42)
    lens_r = int(s * 0.32)
    ring_w = max(2, int(s * 0.10))
    # subtle inner glass tint
    cmask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(cmask).ellipse((cx - lens_r + ring_w, cy - lens_r + ring_w,
                                    cx + lens_r - ring_w, cy + lens_r - ring_w), fill=255)
    glass = Image.new("RGBA", (s, s), (0, 217, 255, 38))
    img.paste(glass, (0, 0), cmask)
    draw_lens_and_handle(img, cx, cy, lens_r, ring_w,
                          ring_top=CYAN, ring_bot=CYAN_DARK,
                          handle_top=CYAN, handle_bot=CYAN_DARK,
                          glow_color=(0, 217, 255, 80), glow_radius=max(4, s // 25))
    draw_E(img, cx, cy, (0, 110, 130, 240), int(lens_r * 1.0))
    return img.resize((size, size), Image.LANCZOS)


# ----------------------------------------------------------------------------
# VARIANT B — WHITE/CREAM background, dark cyan content
# Friendly, app-store typical
# ----------------------------------------------------------------------------
def variant_B(size=128, scale=4):
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    # White bg with rounded corners
    bg = Image.new("RGBA", (s, s), (248, 250, 252, 255))  # #f8fafc
    corner = max(4, s // 6)
    img.paste(bg, (0, 0), rounded_mask(s, s, corner))
    cx, cy = int(s * 0.42), int(s * 0.42)
    lens_r = int(s * 0.32)
    ring_w = max(2, int(s * 0.11))
    # Inner glass: very light cyan
    cmask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(cmask).ellipse((cx - lens_r + ring_w, cy - lens_r + ring_w,
                                    cx + lens_r - ring_w, cy + lens_r - ring_w), fill=255)
    img.paste(Image.new("RGBA", (s, s), (210, 245, 252, 255)), (0, 0), cmask)
    # Lens + handle in deep cyan (better contrast on white)
    draw_lens_and_handle(img, cx, cy, lens_r, ring_w,
                          ring_top=CYAN_DARK, ring_bot=CYAN_DEEP,
                          handle_top=CYAN_DARK, handle_bot=CYAN_DEEP,
                          glow_color=None, glow_radius=0)
    draw_E(img, cx, cy, (0, 110, 130, 255), int(lens_r * 1.0))
    return img.resize((size, size), Image.LANCZOS)


# ----------------------------------------------------------------------------
# VARIANT C — CYAN gradient background, white lens with E
# Bold, statement-piece
# ----------------------------------------------------------------------------
def variant_C(size=128, scale=4):
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    # cyan vertical gradient bg
    bg = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    px = bg.load()
    for y in range(s):
        t = y / max(1, s - 1)
        c = lerp(CYAN, CYAN_DARK, t)
        for x in range(s):
            px[x, y] = c
    corner = max(4, s // 6)
    img.paste(bg, (0, 0), rounded_mask(s, s, corner))
    cx, cy = int(s * 0.42), int(s * 0.42)
    lens_r = int(s * 0.32)
    ring_w = max(2, int(s * 0.11))
    # Inner glass: near-white
    cmask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(cmask).ellipse((cx - lens_r + ring_w, cy - lens_r + ring_w,
                                    cx + lens_r - ring_w, cy + lens_r - ring_w), fill=255)
    img.paste(Image.new("RGBA", (s, s), (245, 252, 255, 255)), (0, 0), cmask)
    # Lens ring + handle in near-black
    NEAR_BLACK = (15, 25, 30, 255)
    draw_lens_and_handle(img, cx, cy, lens_r, ring_w,
                          ring_top=NEAR_BLACK, ring_bot=(40, 50, 55, 255),
                          handle_top=NEAR_BLACK, handle_bot=(40, 50, 55, 255),
                          glow_color=None, glow_radius=0)
    draw_E(img, cx, cy, NEAR_BLACK, int(lens_r * 1.0))
    return img.resize((size, size), Image.LANCZOS)


for letter, fn in [("A_transparent", variant_A), ("B_white", variant_B), ("C_cyan", variant_C)]:
    img = fn(128)
    p = os.path.join(OUT, f"{letter}_128.png")
    img.save(p, "PNG")
    print(f"  {p}")
    # also small preview at 32
    fn(32).save(os.path.join(OUT, f"{letter}_32.png"))
print("Done.")
