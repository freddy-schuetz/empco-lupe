"""normalize_screenshots.py — convert raw screenshots to Chrome Store format.

Drops alpha, resizes/letterboxes to 1280x800. Reads from store/screenshots-raw/,
writes to store/screenshots/.

Behavior per input:
  - if aspect matches 1280:800 (1.6) -> just resize
  - if wider  -> center-crop horizontally to 1.6
  - if taller -> center-crop vertically
  Then resize to 1280x800. RGB (no alpha).
"""
import os
from PIL import Image

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "screenshots-raw")
DST = os.path.join(HERE, "screenshots")
os.makedirs(SRC, exist_ok=True)
os.makedirs(DST, exist_ok=True)

TARGET_W, TARGET_H = 1280, 800
TARGET_RATIO = TARGET_W / TARGET_H

files = sorted([f for f in os.listdir(SRC) if f.lower().endswith((".png", ".jpg", ".jpeg"))])
if not files:
    print(f"No screenshots in {SRC}. Drop your raw captures there and re-run.")
else:
    for i, fn in enumerate(files, 1):
        im = Image.open(os.path.join(SRC, fn)).convert("RGBA")
        w, h = im.size
        ratio = w / h
        if ratio > TARGET_RATIO:
            # too wide -> trim sides
            new_w = int(h * TARGET_RATIO)
            left = (w - new_w) // 2
            im = im.crop((left, 0, left + new_w, h))
        elif ratio < TARGET_RATIO:
            # too tall -> trim top+bottom
            new_h = int(w / TARGET_RATIO)
            top = (h - new_h) // 2
            im = im.crop((0, top, w, top + new_h))
        im = im.resize((TARGET_W, TARGET_H), Image.LANCZOS)
        # composite onto white background to drop alpha
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        out = os.path.join(DST, f"screenshot-{i:02d}.png")
        bg.save(out, "PNG")
        print(f"  {fn} -> {out}")
    print(f"\nDone. {len(files)} files normalized into {DST}/")
