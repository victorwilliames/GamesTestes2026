#!/usr/bin/env python3
"""
Inspect visual differences and smoothing degradation across FXAA early-exit thresholds:
- full (production custom FXAA, constant 0.035 early exit)
- fxaa_thr035 (uniform 0.035 control)
- fxaa_thr050 (uniform 0.050 early exit)
- fxaa_thr070 (uniform 0.070 early exit)
- no_fxaa (raw 3D, no AA)
"""

from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

BASE_DIR = Path("docs/migration/visual")

def main():
    modes = [
        ("FULL (0.035 const)", "fxaa_threshold_full.png"),
        ("THR 0.035 (uniform)", "fxaa_threshold_fxaa_thr035.png"),
        ("THR 0.050", "fxaa_threshold_fxaa_thr050.png"),
        ("THR 0.070", "fxaa_threshold_fxaa_thr070.png"),
        ("NO_FXAA (Raw 3D)", "fxaa_threshold_no_fxaa.png"),
    ]

    images = {}
    for name, fname in modes:
        fpath = BASE_DIR / fname
        if not fpath.exists():
            print(f"Missing image {fpath}")
            return
        images[name] = Image.open(fpath).convert("RGB")

    w, h = images[modes[0][0]].size
    print(f"Image dimensions: {w}x{h}")

    # 1. Check difference between full and fxaa_thr035 (should be 0 or near 0, constant vs uniform control)
    img_full = images["FULL (0.035 const)"]
    img_thr035 = images["THR 0.035 (uniform)"]
    diff_ctrl = ImageChops.difference(img_full, img_thr035)
    bbox_ctrl = diff_ctrl.getbbox()
    print(f"Difference FULL vs THR 0.035 (Control): bbox={bbox_ctrl}, extrema={diff_ctrl.getextrema()}")

    # 2. Check difference between thr035 and thr050
    img_thr050 = images["THR 0.050"]
    diff_050 = ImageChops.difference(img_thr035, img_thr050)
    print(f"Difference THR 0.035 vs THR 0.050: bbox={diff_050.getbbox()}, extrema={diff_050.getextrema()}")

    # 3. Check difference between thr035 and thr070
    img_thr070 = images["THR 0.070"]
    diff_070 = ImageChops.difference(img_thr035, img_thr070)
    print(f"Difference THR 0.035 vs THR 0.070: bbox={diff_070.getbbox()}, extrema={diff_070.getextrema()}")

    # 4. Helper function to create 4x zoom strips across all 5 modes
    def create_zoom_strip(crop_rect, title, out_path):
        cw = crop_rect[2] - crop_rect[0]
        ch = crop_rect[3] - crop_rect[1]
        scale = 4
        zw = cw * scale
        zh = ch * scale
        strip = Image.new("RGB", (zw * len(modes) + (len(modes) + 1) * 10, zh + 40), (18, 18, 22))
        d = ImageDraw.Draw(strip)
        for i, (mname, _) in enumerate(modes):
            cropped = images[mname].crop(crop_rect).resize((zw, zh), Image.Resampling.NEAREST)
            x_pos = 10 + i * (zw + 10)
            strip.paste(cropped, (x_pos, 30))
            d.text((x_pos, 8), mname, fill=(220, 220, 220))
        strip.save(out_path)
        print(f"Saved {title} to {out_path}")

    # Crops in 1280x720:
    # Caitlyn center-ish: ~ (610, 430, 670, 510)
    create_zoom_strip((610, 430, 670, 510), "Caitlyn Zoom 4x", BASE_DIR / "fxaa_thr_caitlyn_zoom_4x.png")
    # Static dummy: ~ (700, 310, 770, 390)
    create_zoom_strip((700, 310, 770, 390), "Dummy Zoom 4x", BASE_DIR / "fxaa_thr_dummy_zoom_4x.png")
    # Grid lines & ring: ~ (550, 460, 630, 540)
    create_zoom_strip((550, 460, 630, 540), "Grid & Ring Zoom 4x", BASE_DIR / "fxaa_thr_grid_ring_zoom_4x.png")

    # 5. Composite side-by-side or stacked summary
    # Let's create a combined image showing full, thr035, thr050, thr070, no_fxaa in a neat comparison
    thumb_w, thumb_h = w // 2, h // 2
    comp_canvas = Image.new("RGB", (thumb_w * 3, thumb_h * 2), (15, 15, 18))
    d_comp = ImageDraw.Draw(comp_canvas)
    
    positions = [
        (0, 0, "FULL (0.035 const)"),
        (thumb_w, 0, "THR 0.035 (uniform control)"),
        (thumb_w * 2, 0, "THR 0.050 (early exit)"),
        (0, thumb_h, "THR 0.070 (early exit)"),
        (thumb_w, thumb_h, "NO_FXAA (Raw 3D)"),
    ]
    for idx, (mname, _) in enumerate(modes):
        x, y, label = positions[idx]
        thumb = images[mname].resize((thumb_w, thumb_h), Image.Resampling.BILINEAR)
        comp_canvas.paste(thumb, (x, y))
        d_comp.rectangle([x, y, x + 240, y + 24], fill=(0, 0, 0, 180))
        d_comp.text((x + 10, y + 5), label, fill=(255, 255, 255))

    out_comp = BASE_DIR / "fxaa_threshold_modes_comparison.png"
    comp_canvas.save(out_comp)
    print(f"Saved full comparison composite to {out_comp}")

if __name__ == "__main__":
    main()
