#!/usr/bin/env python3
"""Rigenera src/30-js/30-carriera/10b-avatar-dati.js dai ritratti pixel art (pacchetto «avatar V12»).

Uso:   python3 -I tools/avatar-da-zip.py CARTELLA_DEL_PACCHETTO
(serve Pillow; la cartella e' quella estratta dallo zip: catalogo.csv, avatars_png/...)

Il pacchetto resta fuori dal repository: nel gioco entra solo un foglio unico di sprite 32x32 (PNG a palette, circa 65 KB), l'elenco
dei nomi (nome|cognome, senza accenti) e il colore della maglia di ogni squadra. Dei giocatori entrano solo nome e cognome gia' presenti
nei roster: niente foto, link, fonti o altri dati personali del pacchetto.
"""
import base64, csv, io, json, re, sys, unicodedata
from pathlib import Path
from PIL import Image

SHIRTS = [('#3f79b4', '#759fc9'), ('#758abd', '#9cabcf'), ('#57ac98', '#86c3b5'), ('#85ad59', '#a7c487'),
          ('#e1a15a', '#e9bb88'), ('#a17bc1', '#bba0d2'), ('#c58078', '#d5a49e'), ('#d15e55', '#de8b85')]   # stesso ordine di AVR_SHIRT in 10c-avatar-retro.js
COLS = 48


def norm(s):   # stessa regola di avKey() nel gioco
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower().replace('ß', 'ss')
    return re.sub('[^a-z0-9]+', ' ', s).strip()


def hexc(c):
    return '#%02x%02x%02x' % c[:3]


def main(root):
    root = Path(root)
    rows = list(csv.DictReader((root / 'catalogo.csv').open(encoding='utf-8-sig')))
    uniq = {}
    for r in rows:
        k = norm(r['nome']) + '|' + norm(r['cognome'])
        uniq.setdefault(k, r)
    keys = sorted(uniq)
    ims = [Image.open(root / uniq[k]['png']).convert('RGB') for k in keys]
    rws = (len(ims) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * 32, rws * 32), (24, 33, 50))
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % COLS) * 32, (i // COLS) * 32))
    pal = sheet.convert('P', palette=Image.ADAPTIVE, colors=256)
    assert list(pal.convert('RGB').getdata()) == list(sheet.getdata()), 'palette non senza perdita'
    buf = io.BytesIO()
    pal.save(buf, 'PNG', optimize=True)
    club = {}
    for r in rows:
        im = Image.open(root / r['png']).convert('RGB')
        c = (hexc(im.getpixel((6, 29))), hexc(im.getpixel((9, 26))))
        if c not in SHIRTS:
            raise SystemExit('maglia sconosciuta %s per %s' % (c, r['team']))
        club.setdefault(r['team'], SHIRTS.index(c))
    out = ['/* RITRATTI (dati) - generato da tools/avatar-da-zip.py: non si modifica a mano, si rigenera.',
           '   AVR_SHEET = foglio unico %d x %d pixel con %d sprite 32x32 (colonna = n %% AVR_COLS, riga = n / AVR_COLS); AVR_NAMES = "nome|cognome" senza accenti,' % (COLS * 32, rws * 32, len(keys)),
           '   nello stesso ordine degli sprite; AVR_CLUB = indice della maglia (AVR_SHIRT) di ogni squadra del foglio. */',
           'const AVR_COLS=%d;' % COLS,
           "const AVR_SHEET='data:image/png;base64,%s';" % base64.b64encode(buf.getvalue()).decode('ascii'),
           'const AVR_NAMES=%s;' % json.dumps('~'.join(keys), ensure_ascii=True).replace('"', "'"),
           'const AVR_CLUB=%s;' % json.dumps(club, ensure_ascii=True, separators=(',', ':'), sort_keys=True), '']
    target = Path(__file__).resolve().parent.parent / 'src/30-js/30-carriera/10b-avatar-dati.js'
    target.write_text('\n'.join(out), encoding='utf-8')
    print('Scritto %s: %d sprite, %d byte di PNG, %d squadre' % (target, len(keys), len(buf.getvalue()), len(club)))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
