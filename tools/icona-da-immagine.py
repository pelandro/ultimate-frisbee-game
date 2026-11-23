#!/usr/bin/env python3
"""Crea le icone del gioco (tools/icone/icona-64, 180, 192, 512 .png) da un'immagine quadrata con sfondo verde uniforme.

Uso:  python3 tools/icona-da-immagine.py percorso/immagine.png
Serve Pillow (pip install pillow). Si lancia solo quando l'icona cambia: i PNG risultanti stanno nel repository
e tools/icona.js li legge, quindi build e test non dipendono da Python.

Il disegno viene ritagliato dal suo riquadro (tutto cio' che non e' sfondo) e centrato su un quadrato dello stesso verde,
con un margine diverso per ogni dimensione: sulle icone dell'app (192 e 512, dichiarate «maskable» nel manifest) deve restare
dentro la zona sicura, cioe' un cerchio largo l'80% del lato, perche' Android le ritaglia in tondo o con gli angoli arrotondati;
l'icona della scheda del browser (64) e' piu' piccola e il disegno la riempie di piu'.
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops

# quanta larghezza del lato occupa il disegno, per dimensione dell'icona
FRAZIONE = {64: 0.94, 180: 0.82, 192: 0.78, 512: 0.78}
MARGINE = 8       # pixel di sfondo tenuti attorno al disegno nel ritaglio
SOGLIA = 40       # quanto un pixel deve differire dallo sfondo per essere «disegno»

def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    img = Image.open(sys.argv[1]).convert("RGB")
    if img.width != img.height:
        sys.exit("L'immagine deve essere quadrata.")
    sfondo = img.getpixel((5, 5))   # il verde uniforme dell'angolo
    diff = ImageChops.difference(img, Image.new("RGB", img.size, sfondo)).convert("L").point(lambda v: 255 if v > SOGLIA else 0)
    box = diff.getbbox()
    if not box:
        sys.exit("Non trovo nessun disegno sullo sfondo.")
    l, t, r, b = box
    ritaglio = img.crop((max(0, l - MARGINE), max(0, t - MARGINE), min(img.width, r + MARGINE), min(img.height, b + MARGINE)))
    uscita = Path(__file__).resolve().parent / "icone"
    uscita.mkdir(exist_ok=True)
    for lato, frazione in FRAZIONE.items():
        w = round(lato * frazione)
        h = round(ritaglio.height * w / ritaglio.width)
        icona = Image.new("RGB", (lato, lato), sfondo)
        icona.paste(ritaglio.resize((w, h), Image.LANCZOS), ((lato - w) // 2, (lato - h) // 2))
        icona.save(uscita / f"icona-{lato}.png", optimize=True)
        print(f"icona-{lato}.png  disegno {w}x{h}")
    print("Colore di sfondo (per il manifest): #%02x%02x%02x" % sfondo)

main()
