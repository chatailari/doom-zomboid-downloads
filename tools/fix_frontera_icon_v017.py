#!/usr/bin/env python3
"""Fix the undersized FRONTERA DE FUEGO Android 14 launcher icon.

Run on the extracted v0.1.6 source; preserves applicationId, updater and assets.
"""
from pathlib import Path
import argparse
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

SOURCE = "app/src/main/res/drawable-nodpi/frontera_icon.png"
RES = "app/src/main/res"
SIZE = 432
ART = 264  # 66/108 dp, ~92% of the adaptive icon's visible 72 dp area

def crop_padding(image):
    image = image.convert("RGBA")
    if min(image.size) < 24:
        raise ValueError("Original icon is too small")
    alpha = image.getchannel("A")
    bounds = alpha.point(lambda a: 255 if a > 20 else 0).getbbox()
    if bounds and bounds != (0, 0, image.width, image.height):
        return image.crop(bounds)
    corners = [image.getpixel(p) for p in
               ((0, 0), (image.width-1, 0), (0, image.height-1),
                (image.width-1, image.height-1))]
    if all(min(rgb[:3]) > 238 and rgb[3] > 250 for rgb in corners):
        rgb = image.convert("RGB")
        mask = rgb.point(lambda v: 255 if v < 218 else 0)
        mask = mask.convert("L")
        bounds = mask.getbbox()
        if bounds and (bounds[2]-bounds[0] > image.width*.25):
            padding = round(min(image.size)*.025)
            return image.crop((max(0,bounds[0]-padding),
                               max(0,bounds[1]-padding),
                               min(image.width,bounds[2]+padding),
                               min(image.height,bounds[3]+padding)))
    return image

def patch(root):
    icon = root / SOURCE
    if not icon.is_file():
        raise FileNotFoundError(icon)
    artwork = crop_padding(Image.open(icon))
    artwork.thumbnail((ART, ART), Image.Resampling.LANCZOS)
    foreground = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    foreground.alpha_composite(artwork, ((SIZE-artwork.width)//2, (SIZE-artwork.height)//2))
    dark_background = Image.new("RGBA", (SIZE, SIZE), (19,21,19,255))
    drawable = root / RES / "drawable-nodpi"
    foreground.save(drawable / "ic_launcher_foreground.png", optimize=True)
    dark_background.save(drawable / "ic_launcher_background.png", optimize=True)
    # Legacy fallback for Android 7 and earlier. An adaptive-only resource
    # can be unresolved on devices below API 26.
    legacy_artwork = crop_padding(Image.open(icon))
    legacy_artwork.thumbnail((368, 368), Image.Resampling.LANCZOS)
    legacy = dark_background.copy()
    legacy.alpha_composite(legacy_artwork, ((SIZE - legacy_artwork.width)//2,
                                          (SIZE - legacy_artwork.height)//2))
    round_mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(round_mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)
    legacy_round = legacy.copy()
    legacy_round.putalpha(round_mask)
    for density, px in (("mdpi",48), ("hdpi",72), ("xhdpi",96),
                        ("xxhdpi",144), ("xxxhdpi",192)):
        folder = root / RES / ("mipmap-" + density)
        folder.mkdir(parents=True, exist_ok=True)
        legacy.resize((px, px), Image.Resampling.LANCZOS).save(folder / "ic_launcher.png")
        legacy_round.resize((px, px), Image.Resampling.LANCZOS).save(folder / "ic_launcher_round.png")
    adaptive = root / RES / "mipmap-anydpi-v26"
    adaptive.mkdir(parents=True, exist_ok=True)
    xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
           '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
           '  <background android:drawable="@drawable/ic_launcher_background"/>\n'
           '  <foreground android:drawable="@drawable/ic_launcher_foreground"/>\n'
           '</adaptive-icon>\n')
    for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        (adaptive/name).write_text(xml, encoding="utf-8")
        ET.parse(adaptive/name)
    manifest = root / "app/src/main/AndroidManifest.xml"
    old = manifest.read_text(encoding="utf-8")
    match = 'android:icon="@drawable/frontera_icon"'
    if old.count(match) != 1:
        raise ValueError("Unexpected launcher icon in manifest")
    manifest.write_text(old.replace(match,
        'android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round"', 1),
        encoding="utf-8")
    ET.parse(manifest)
    gradle = root/"app/build.gradle"
    config = gradle.read_text(encoding="utf-8")
    for old_value, new_value in [("versionCode 7", "versionCode 8"),
                                 ("versionName '0.1.6'", "versionName '0.1.7'")]:
        if config.count(old_value) != 1:
            raise ValueError("Unexpected Gradle version: "+old_value)
        config = config.replace(old_value, new_value, 1)
    gradle.write_text(config, encoding="utf-8")
    if "cl.nazaret.fronteradefuego" not in config:
        raise ValueError("Original package identity missing")
    print("FRONTERA 0.1.7 adaptive icon created; package unchanged; original signing required.")

if __name__ == "__main__":
    p=argparse.ArgumentParser()
    p.add_argument("root", type=Path)
    patch(p.parse_args().root)
