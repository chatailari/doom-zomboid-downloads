"""Regression checks for FRONTERA icon patch, without signing secrets."""
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image, ImageDraw
from tools.fix_frontera_icon_v017 import patch

def test_adaptive_icon():
    with TemporaryDirectory() as tmp:
        root=Path(tmp)
        path=root/"app/src/main/res/drawable-nodpi/frontera_icon.png"
        path.parent.mkdir(parents=True)
        old=Image.new("RGBA",(512,512),"white")
        ImageDraw.Draw(old).rectangle((120,120,392,392),fill="#ab471e")
        old.save(path)
        manifest=root/"app/src/main/AndroidManifest.xml"
        manifest.write_text('<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application android:icon="@drawable/frontera_icon" /></manifest>')
        gradle=root/"app/build.gradle"
        gradle.write_text("applicationId 'cl.nazaret.fronteradefuego'\nversionCode 7\nversionName '0.1.6'\n")
        patch(root)
        fg=Image.open(root/"app/src/main/res/drawable-nodpi/ic_launcher_foreground.png")
        bg=Image.open(root/"app/src/main/res/drawable-nodpi/ic_launcher_background.png")
        assert fg.size==(432,432) and bg.size==(432,432)
        bbox=fg.getchannel("A").getbbox()
        assert 230<=bbox[2]-bbox[0]<=264, bbox
        assert bg.getpixel((0,0))[:3]==(19,21,19)
        # Legacy launchers must resolve the icon at every density.
        for density, size in (("mdpi",48),("hdpi",72),("xhdpi",96),
                              ("xxhdpi",144),("xxxhdpi",192)):
            for filename in ("ic_launcher.png", "ic_launcher_round.png"):
                assert Image.open(root/"app/src/main/res"/("mipmap-"+density)/filename).size == (size,size)
        assert '@mipmap/ic_launcher' in manifest.read_text()
        assert 'versionCode 8' in gradle.read_text()
        assert "versionName '0.1.7'" in gradle.read_text()
        assert 'cl.nazaret.fronteradefuego' in gradle.read_text()

if __name__=="__main__":
    test_adaptive_icon()
    print("Adaptive icon checks passed")
