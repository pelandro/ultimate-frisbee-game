"""Ricalcola i due fogli degli Overall dai CSV locali, con la sola libreria standard."""
import csv
import hashlib
import json
import random
import unicodedata
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
MIN_ROSA, MAX_ROSA = 16, 28
NOMI = {
    'DE': 'Anika Clara Jule Lena Hannah Johanna Maren Paula Lea Nora Klara Nele Luisa Marie Lotta Emma Amelie Greta Carla Frida Nina Elisa Jana Eva'.split(),
    'FR': 'Élise Camille Marion Lucie Claire Jeanne Anaïs Alice Louise Juliette Manon Maëlle Léonie Inès Julie Léa Agathe Adèle Victoire Noémie'.split(),
    'BE': 'Amélie Lotte Elise Camille Hanne Manon Anouk Lise Noémie Noor Sofie Emma Fien Axelle Inès Pauline Marie Zoé Margaux Eva'.split(),
    'UK': 'Amelia Harriet Emily Alice Chloe Lucy Bethany Olivia Poppy Hannah Sophie Holly Imogen Zoe Erin Laura Grace Millie Megan Isla'.split(),
}
COGNOMI = {
    'DE': 'Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann Koch Richter Klein Wolf Neumann Schwarz Zimmermann Braun Krüger Hartmann Lange Werner Krause Lehmann'.split(),
    'FR': 'Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia David Bertrand Roux Vincent Fournier Morel Girard André Mercier'.split(),
    'BE': ['Peeters','Janssens','Maes','Jacobs','Mertens','Willems','Claes','Goossens','Wouters','De Smet','Dubois','Lambert','Dupont','Lefebvre','Renard','Hermans','Vandenberghe','Van Damme','De Backer','Claeys','Declercq','Pauwels','Michiels','Aerts'],
    'UK': 'Smith Jones Taylor Brown Williams Wilson Johnson Davies Robinson Wright Thompson Evans Walker White Roberts Green Hall Wood Jackson Clarke Patel Khan Lewis Harrison'.split(),
}


def leggi(file):
    with (HERE / file).open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def salva(file, righe):
    with (HERE / file).open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=righe[0].keys(), lineterminator='\n')
        writer.writeheader()
        writer.writerows(righe)


def chiave(nome):
    return ''.join(c for c in unicodedata.normalize('NFKD', nome.casefold()) if c.isalnum())


def potenza(valori):
    ordinati = sorted(valori, reverse=True)[:21]
    ordinati += [max(25, ordinati[-1] - 8)] * (21 - len(ordinati))
    return sum(p * sum(ordinati[i:i + 7]) / 7 for i, p in [(0, .60), (7, .35), (14, .05)])


def livello_club(club, partite, piazzamenti):
    paese, nome = club['paese'], club['squadra']
    campo = {'UK': 8, 'BE': 16, 'DE': 16, 'FR': 13}[paese]
    posizione = int(club['piazzamento_finale'])
    scarti = []
    for gara in partite:
        if gara['paese'] != paese or nome not in (gara['squadra_1'], gara['squadra_2']):
            continue
        a, b = int(gara['mete_1']), int(gara['mete_2'])
        if a + b <= 1:
            continue
        margine = (a-b) / (a+b) * (1 if gara['squadra_1'] == nome else -1)
        scarti.append(max(-.65, min(.65, margine)))
    nazionale = 68 + 16 * (campo-posizione) / (campo-1) + 4 * sum(scarti) / (len(scarti)+3)
    esteri = []
    for r in piazzamenti:
        if r['squadra'] == nome:
            rango = (int(r['posizione'])-1) / (int(r['partecipanti'])-1)
            esteri.append((92 if r['evento'] == 'WU' else 91) - 13*rango)
    peso = .30 if nome in ('Mooncup Nova', 'Mooncup Astra') else .60
    return round(nazionale + (peso * (sum(esteri)/len(esteri)-nazionale) if esteri else 0), 2)


def rendimento(r):
    g = int(r['gare'] or 0)
    if not g or r['mete'] == '' or r['assist'] == '':
        return 0
    return (int(r['mete']) + int(r['assist'])) / (g+4)


def valuta(atleta, livello, fonti):
    dom = club = mixed = giovani = soglia = 0
    gruppi = set()
    assist = mete = 0
    eventi_mixed = set()
    for r in fonti:
        e, prod = r['evento'], rendimento(r)
        if e in ('UKU', 'BUOC'):
            dom = max(dom, min(7, 2.5*prod) if e=='UKU' else min(2, 2*prod))
            if e=='UKU' or prod:
                gruppi.add('domestico')
        elif e in ('WU', 'EU', 'BIR') or ' Tour ' in e or 'Invite' in e:
            peso = 2.2 if e in ('WU','EU') else 1.35
            club = max(club, min(6, peso*prod))
            if prod:
                gruppi.add('club')
        elif e=='WUCW' or e=='EUCW':
            soglia = max(soglia, (85 if e=='WUCW' else 82) if int(r['gare'] or 0)>0 else 0)
            gruppi.add('nazionale')
        elif e=='MX-World Games 2025':
            soglia = max(soglia, 90)
            gruppi.add('nazionale')
        elif e in ('MX-WUC', 'MX-EUC', 'MX-WU', 'MX-EU', 'MX-BEACH'):
            mixed = max(mixed, min(3, prod * (.55 if e=='MX-BEACH' else 1.4)))
            if int(r['gare'] or 0):
                if e=='MX-WUC':
                    soglia = max(soglia, 85)
                elif e=='MX-EUC':
                    soglia = max(soglia, 82)
                gruppi.add('mixed')
        elif e=='U24W' or e=='MX-U24' or e.startswith('WJUC'):
            giovani = max(giovani, min(2.5, prod))
            soglia = max(soglia, 80 if '24' in e else 75)
            gruppi.add('giovanile')
        elif e.startswith(('France Women senior', 'France Mixed senior')):
            soglia = max(soglia, 84)
            gruppi.add('selezione')
        elif e.startswith('DFV') or e.startswith('GB U'):
            if 'senior' in e or 'mixed gruppo' in e:
                soglia = max(soglia, 81)
            elif 'U24' in e:
                soglia = max(soglia, 77)
            elif 'U20' in e or 'U17' in e:
                soglia = max(soglia, 74)
            gruppi.add('selezione')
        elif e=='Ultiworld Europa 2026':
            posizione = int(r['posizione_editoriale'])
            soglia = max(soglia, 93 if posizione<=5 else 91 if posizione<=10 else 88)
            gruppi.add('stampa')
        if e.startswith('MX-') and e!='MX-club beach elenco':
            eventi_mixed.add(e)
        if e in ('UKU','WU','EU') or (e.startswith('MX-') and int(r['gare'] or 0)):
            mete += int(r['mete'] or 0)
            assist += int(r['assist'] or 0)
    # Il dato mancante dà un contributo nullo. I campioni brevi sono ridotti dal denominatore.
    totale = livello-3 + dom + club + mixed + giovani
    ovr = max(soglia, min(93, round(totale)))
    ruolo = 'B'
    if mete+assist>=6:
        if assist>=1.5*mete:
            ruolo = 'H'
        elif mete>=1.5*assist:
            ruolo = 'C'
    return dict(id=atleta['id'], nome=atleta['nome'], tipo='reale', overall=ovr, ruolo=ruolo,
                base_ruolo='produzione' if ruolo!='B' else 'profilo di gioco',
                affidabilita='alta' if len(gruppi)>=3 else 'media' if gruppi else 'bassa',
                base_club=round(livello-3,2), domestico=round(dom,3), club_estero=round(club,3),
                mixed=round(mixed,3), giovanile=round(giovani,3), soglia=soglia,
                eventi_mixed=' | '.join(sorted(eventi_mixed)), origine=atleta['fonte_assegnazione'],
                fonte=atleta['url'])


def completa(nome, paese, livello, rosa, riservati):
    rng = random.Random(int.from_bytes(hashlib.sha256(('euw26|'+nome).encode()).digest()[:8], 'big'))
    tetto = min([88] + [p["overall"] for p in rosa])
    for posto in range(len(rosa), MIN_ROSA):
        while True:
            n = rng.choice(NOMI[paese])+' '+rng.choice(COGNOMI[paese])
            if chiave(n) not in riservati:
                riservati.add(chiave(n))
                break
        # Profilo maschile lnShape. Con pochi nomi, anche i titolari generati servono alla squadra.
        curva = 4.2-1.45*posto if posto<7 else -4.5-.65*(posto-6)
        rosa.append(dict(id='gen-'+paese+'-'+chiave(nome)+'-'+str(posto+1), nome=n,
                         tipo='generata', overall=min(tetto, round(livello+3+curva)), ruolo='B',
                         base_ruolo='profilo di gioco', affidabilita='simulata', base_club='',
                         domestico='', club_estero='', mixed='', giovanile='', soglia='',
                         eventi_mixed='', origine='completamento fino a 16', fonte=''))
    # Riserviamo almeno tre cutter e sei handler come negli schieramenti maschili.
    for ruolo, minimo in [('C',3),('H',6)]:
        necessari = minimo-sum(p['ruolo']==ruolo for p in rosa)
        liberi = sorted((p for p in rosa if p['ruolo']=='B'), key=lambda p:(p['tipo']!='generata',p['id']))
        for p in liberi[:max(0,necessari)]:
            p['ruolo']=ruolo
    for p in rosa:
        if p['tipo']=='generata' and p['ruolo']=='B':
            p['ruolo']='D' if rng.random()<.2 else 'C'


def main():
    clubs = leggi('../club.csv')
    gare = leggi('../risultati.csv')
    piazzamenti = leggi('piazzamenti-internazionali.csv')
    identita = leggi('identita.csv')
    evidenze = defaultdict(list)
    for r in leggi('evidenze.csv'):
        evidenze[r['id']].append(r)
    riservati = {r['id'] for r in identita}
    for r in leggi('casi-da-rivedere.csv'):
        riservati.add(chiave(r['nome']))
    rose, riepiloghi = [], []
    for c in sorted(clubs, key=lambda x:(x['paese'],int(x['piazzamento_finale']))):
        nome, paese = c['squadra'], c['paese']
        livello = livello_club(c, gare, piazzamenti)
        reali = [valuta(p, livello, evidenze[p['id']]) for p in identita if p['squadra']==nome]
        reali.sort(key=lambda p:(-p['overall'],p['id']))
        rosa, riserve = reali[:MAX_ROSA], reali[MAX_ROSA:]
        completa(nome, paese, livello, rosa, riservati)
        assert len(rosa)==min(MAX_ROSA,max(MIN_ROSA,len(reali))), nome
        assert len({chiave(p['nome']) for p in rosa})==len(rosa), nome
        assert all(p['tipo']!='generata' for p in rosa) or len(reali)<MIN_ROSA, nome
        assert sum(p['ruolo']=='H' for p in rosa)>=6 and sum(p['ruolo']=='C' for p in rosa)>=3, nome
        assert all(25<=p['overall']<=99 for p in rosa), nome
        for stato, lista in [('in rosa',rosa),('riserva oltre limite',riserve)]:
            for p in sorted(lista,key=lambda x:(-x['overall'],x['id'])):
                rose.append(dict(paese=paese,squadra=nome,stato=stato,**p))
        valori=[p['overall'] for p in rosa]
        riepiloghi.append(dict(paese=paese,squadra=nome,piazzamento=c['piazzamento_finale'],
                              livello_risultati=livello,potenza=round(potenza(valori),2),reali=min(len(reali),MAX_ROSA),
                              generate=sum(p['tipo']=='generata' for p in rosa),riserve=len(riserve),
                              minimo=min(valori),massimo=max(valori)))
    assert len({r['id'] for r in rose})==len(rose)
    assert all(MIN_ROSA<=r['reali']+r['generate']<=MAX_ROSA for r in riepiloghi)
    salva('overall.csv',rose)
    salva('squadre.csv',riepiloghi)


# Conserva chiavi distinte per i club già presenti nel catalogo Open.
OMO_NOMI_OPEN = {
    'Freezgo', 'Stade Bordelais', 'NLSU', 'Monkey', 'Tsunami', 'PUC Ultimate',
    'A.S.U.L. Ultimate', 'Tchac', 'Jets', 'BTR', 'RFO', "Révolution'Air",
    'PUC Ultimate 2', 'Heidees', 'Hucks Ultimate Club Berlin', 'FT Würzburg Ultimate', 'Bonnsai',
}


def esporta_gioco():
    """Esporta le rose approvate e i gironi della prima stagione tedesca."""
    club = leggi('squadre.csv')
    gironi = {}
    for r in leggi('../risultati.csv'):
        if r['paese'] == 'DE' and 'Vorrunde' in r['fase']:
            for n in (r['squadra_1'], r['squadra_2']):
                gironi[n] = r['fase'][-1]
    limiti = {}
    for r in leggi('evidenze.csv'):
        evento = r['evento']
        for tetto, categoria in [(16, 'U17'), (19, 'U20'), (19, 'WJUC'), (23, 'U24')]:
            if categoria in evento:
                limiti[r['id']] = min(tetto, limiti.get(r['id'], tetto))
    rose = defaultdict(list)
    for r in leggi('overall.csv'):
        if r['stato'] == 'in rosa':
            rose[r['squadra']].append([r['nome'], r['ruolo'], int(r['overall']),
                                     int(r['tipo']=='generata'), limiti.get(r['id'], 0)])

    def js(value):
        return json.dumps(value, ensure_ascii=False, separators=(',', ':'))

    out = ['/* Dati 2026 da docs/europa-women-2026/valutazioni/calcola.py --gioco.',
           '   Rosa: [nome completo, profilo, Overall, generata, limite giovanile]. */',
           'const LN_WOMEN_FIRST_NAMES='+js(NOMI)+';']
    for paese in ('UK', 'BE', 'FR', 'DE'):
        lk = paese+'W'
        squadre, giocatrici = [], []
        for c in club:
            if c['paese'] != paese:
                continue
            n = c['squadra']
            nome = n+' Women' if n in OMO_NOMI_OPEN else n
            squadre.append([nome, 'N1', gironi[n] if paese=='DE' else '',
                            round(float(c['potenza'])+2, 2)])
            giocatrici.append('  '+js(nome)+':'+js(rose[n]))
        out.extend(['LN_CL.'+lk+'='+js(squadre)+';', 'LN_PL.'+lk+'={', ',\n'.join(giocatrici), '};'])
    gioco = HERE.parents[2]/'src/30-js/37-leghe/00-dati-women-europa.js'
    gioco.write_text('\n'.join(out)+'\n', encoding='utf-8')


if __name__=='__main__':
    main()
    if '--gioco' in sys.argv:
        esporta_gioco()
