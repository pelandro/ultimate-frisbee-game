"""Rigenera le schede del gioco e il prospetto di revisione dai dati sportivi locali."""
import csv
import hashlib
import json
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs'
DATA = json.loads((DOC / 'USA-WOMEN-2026-DATI.json').read_text())
REGIONS = dict(zip(('Northeast', 'Mid-Atlantic', 'Southeast', 'Great Lakes',
                    'North Central', 'South Central', 'Northwest', 'Southwest'),
                   ('NE', 'MA', 'SE', 'GL', 'NC', 'SC', 'NW', 'SW')))
ALIASES = DATA['clubAliases']


def key(name):
    return ''.join(c for c in unicodedata.normalize('NFKD', name).casefold() if c.isalnum())


def stable(name):
    return int.from_bytes(hashlib.sha256(name.encode()).digest()[:4], 'big')


def limited(value, low, high):
    return max(low, min(high, value))


def read_csv(filename):
    with (DOC / filename).open() as stream:
        return list(csv.DictReader(stream))


def write_csv(filename, rows):
    with (DOC / filename).open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def encode(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def team_ratings():
    official = {t['name']: t for t in DATA['teams']}
    selected = {i for group in DATA['regionalCandidateRanks'].values() for i in group}
    ratings, clubs = {}, {}
    for t in DATA['projectedTeams']:
        club = ALIASES.get(t['name'], t['name'])
        ranking = official.get(club, {}).get('officialRanking', t)
        ratings[club] = ranking['rating']
        if t['rank'] in selected:
            clubs[club] = dict(club=club, region=t['region'], rating=ranking['rating'],
                               ranking_source=ranking['source'])
    results = read_csv('USA-WOMEN-2026-RISULTATI.csv')
    for m in DATA['matches']:
        a, b = m['teams']
        results.append(dict(team_a=a['team'], goals_a=a['goals'],
                            team_b=b['team'], goals_b=b['goals'], phase='nationals'))
    residuals = defaultdict(list)
    for r in results:
        a, b = r['team_a'], r['team_b']
        if a not in ratings or b not in ratings:
            continue
        ga, gb = int(r['goals_a']), int(r['goals_b'])
        if ga + gb == 0:
            continue
        delta = limited((ga - gb) / (ga + gb), -.6, .6)
        expected = limited((ratings[a] - ratings[b]) / 2200, -.6, .6)
        weight = {'nationals': 2, 'regionals': 1.5}.get(r['phase'], 1)
        for c, sign in ((a, 1), (b, -1)):
            residuals[c].append((weight, sign * (delta - expected)))
    lo, hi = min(c['rating'] for c in clubs.values()), max(c['rating'] for c in clubs.values())
    for club, c in clubs.items():
        games = residuals[club]
        form = sum(w * d for w, d in games) / (6 + sum(w for w, _ in games))
        c.update(games_used=len(games), form=round(limited(6 * form, -1.5, 1.5), 2))
        c['prior'] = round(71 + 16 * (c['rating'] - lo) / (hi - lo) + c['form'], 2)
    return clubs


def performance(e, games):
    # Totali ai Nationals per gara del CLUB. Una lacuna resta neutra.
    if not any(e.get(k) is not None for k in ('goals', 'assists', 'blocks')):
        return 0
    g, a, b = (e[k] or 0 for k in ('goals', 'assists', 'blocks'))
    # I turnover non hanno il denominatore dei possessi: correzione solo per eccessi.
    excess = max(0, (e.get('turnovers') or 0) - (a + g + 3))
    return limited((g + a + 1.7 * b - .2 * excess - games * 1.25) / (games + 3) * 3, -2, 7)


AWARD_FLOORS = {
    'All-Club First Team': 93, 'All-Club Second Team': 90,
    'All-WUL First Team': 88, 'All-WUL Second Team': 85,
    'PUL MVP': 90, 'WUL MVP': 90, 'PUL OPOY': 88, 'WUL OPOY': 88,
    'PUL DPOY': 88, 'WUL DPOY': 88, 'WUL Breakout': 85,
    'WUL All-Star': 82, 'PUL All-Star': 82, 'PUL All-Star alternate': 79,
}


def national_floor(event, status):
    if status == 'alternate_announced':
        return 84
    if 'WJUC' in event:
        return 75
    if 'WU24' in event:
        return 80
    if '2022' in event:
        return 86
    return 90 if 'World Games' in event else 87


def historical_rating(e, has_pro_games):
    """Scarto sulla base del club e soglia assoluta. Un invito documenta selettività."""
    level, status, year = e['level'], e['status'], e['eventYear']
    if status == 'affiliazione precedente':
        return 0, 0
    if status == 'invito':
        if year <= 2020:
            return int(has_pro_games), 0
        if level in ('senior', 'beach senior'):
            return 2, 82
        return 1, 0
    if level == 'college':
        return (2 if year == 2026 else int(has_pro_games)), 0
    if level == 'senior' and year <= 2020:
        return 2, 84
    if level == 'club':
        return (3 if status == 'profilo di punta' else 2 if year == 2026 else 1), 0
    offset, minimum = {'U20': (2, 75), 'U24': (3, 80),
                       'beach senior': (3, 84), 'senior': (4, 87)}[level]
    # Solo per referti WFDF, almeno cinque gare: un ulteriore punto per produzione alta.
    games = e.get('games', 0)
    extra = int(games >= 5 and e['goals'] + e['assists'] >= 1.5 * games)
    return offset + extra, minimum + extra


def evidence_for(name, club, person, total, games, opponent_bonus, records):
    sources, floors = set(), {}
    roles, age, exact, age_source, age_bound = {}, None, False, '', 39
    wucc = []
    def floor(label, value):
        floors[label] = max(floors.get(label, 0), value)
    def selection(event, status):
        nonlocal age_bound
        floor(event, national_floor(event, status))
        if 'WJUC' in event:
            age_bound = min(age_bound, 19)
        if 'WU24' in event:
            age_bound = min(age_bound, 24)
    for e in person.get('national', []):
        sources.add(e['source'])
        selection(e['event'], e['rosterStatus'])
    for e in person.get('evidence', []):
        if e['team'] != club:
            continue
        kind = e['type']
        if kind == 'role_reported':
            roles[0] = dict(handler='H', thrower='H', cutter='C', defender='D', hybrid='B')[e['role']]
        elif kind == 'award':
            award, place = e['award'], e['place']
            if award in AWARD_FLOORS:
                floor(award, AWARD_FLOORS[award])
            elif award == 'Player of the Year':
                floor(award, 95)
            else:
                base = 90 if award.startswith('Breakout') else 94
                floor(f'{award} #{place}', base - (place - 1) * 2)
                if award.startswith('Defensive'):
                    roles[1] = 'D'
        elif kind == 'editorial_rank':
            floor('Top 25 #' + str(e['rank']), 92 if e['rank'] <= 5 else 90 if e['rank'] <= 10 else 87)
        elif kind.startswith('wucc_'):
            wucc.append(e)
        else:
            continue
        sources.add(e['source'])
    history, history_labels = 0, []
    historical_support = False
    has_pro_games = any(e['type'] == 'pul_regular_season' and e['games'] > 0 for e in records)
    for e in records:
        sources.add(e['source'])
        kind = e['type']
        if kind == 'world_games_roster':
            exact, age, age_source = True, e['ageOn20261120'], e['source']
            selection(e['event'], 'named')
        elif kind == 'age_at_event' and not exact:
            age, age_source = e['age'] + DATA['season'] - DATA['sources'][e['source']]['year'], e['source']
        elif kind == 'history':
            delta, minimum = historical_rating(e, has_pro_games)
            history = max(history, delta)
            label = ' '.join(str(e.get(k, '')) for k in ('team', 'level', 'eventYear', 'status')).strip()
            history_labels.append(label)
            if minimum:
                floor(label, minimum)
            historical_support |= e['status'] not in ('invito', 'affiliazione precedente')
            if e.get('role'):
                roles[0] = e['role']
            if e['level'] in ('U20', 'U24'):
                upper = 19 if e['level'] == 'U20' else 23
                age_bound = min(age_bound, upper + DATA['season'] - e['eventYear'])
        elif kind == 'national_selection':
            selection(e['event'], 'named')
        elif kind == 'pul_regular_season' and e['games'] > 0:
            points = (e['offensivePoints'] or 0) + (e['defensivePoints'] or 0)
            g, a, b = e['goals'], e['assists'], e['blocks']
            # Denominatore in punti effettivi + 24 punti di attenuazione.
            impact = (g + a + 1.7 * b) / (points + 24)
            floor('PUL 2026', round(min(88, 75 + 32 * impact)))
            if points >= 24:
                if b >= 3 and (e['defensivePoints'] or 0) >= .65 * points:
                    roles[5] = 'D'
                elif a >= 4 and (a >= 1.5 * g or (e['touches'] or 0) > 1.8 * points):
                    roles[5] = 'H'
                elif g >= 4 and g >= 1.5 * a:
                    roles[5] = 'C'
        elif kind == 'pro':
            floor(e['award'], AWARD_FLOORS[e['award']])
            if e.get('role'):
                roles[2] = e['role']
    if age is None:
        age = min(age_bound, 19 + stable('age|' + name) % 14)
        age_source = 'stima giovanile' if age_bound < 39 else 'stima di gioco'
    g, a, b = (total.get(k) or 0 for k in ('goals', 'assists', 'blocks'))
    if b >= 4 and 2 * b >= max(g, a):
        roles[3] = 'D'
    elif a >= 3 and a >= 1.5 * g:
        roles[3] = 'H'
    elif g >= 3 and g >= 1.5 * a:
        roles[3] = 'C'
    # Un totale WUCC sostituisce i singoli referti dello stesso torneo.
    totals = [e for e in wucc if e['type'] == 'wucc_tournament_stats']
    ws = totals or wucc
    contributions = sum((e.get('goals') or 0) + (e.get('assists') or 0) for e in ws)
    wg = sum(e.get('games', 1) for e in ws)
    world = limited(2 * max(0, contributions - wg) / (wg + 4), 0, 4)
    if ws:
        wa, wgo = sum(e.get('assists') or 0 for e in ws), sum(e.get('goals') or 0 for e in ws)
        if max(wa, wgo) >= 5 and max(wa, wgo) >= 1.6 * min(wa, wgo):
            roles[4] = 'H' if wa > wgo else 'C'
    role = roles[min(roles)] if roles else 'B'
    basis = ('profilo pubblicato' if any(i < 3 for i in roles) else
             'statistiche' if roles else 'profilo di gioco')
    domestic = performance(total, games) if total else 0
    return dict(history_offset=history, history_basis=' | '.join(sorted(set(history_labels))),
                history_supported=historical_support, nationals=round(domestic, 2), opponent=round(opponent_bonus, 2),
                wucc=round(world, 2), floor=max(floors.values(), default=0),
                references=' | '.join(sorted(floors)), role=role, role_basis=basis,
                age=age, age_exact=exact, age_source=age_source, sources=' | '.join(sorted(sources)))


def generate():
    clubs = team_ratings()
    people = {key(alias): p for p in DATA['players'] for alias in [p['name'], *p['aliases']]}
    evidence = defaultdict(list)
    for name, records in DATA['ratingEvidence2026'].items():
        evidence[key(name)].extend(records)
    rosters = defaultdict(list)
    for p in DATA['players']:
        for e in p['evidence']:
            if e['type'] == 'usau_nationals_roster_totals':
                rosters[e['team']].append((p['name'], e['source'], e))
    for r in DATA['nonNationalsEventRosters']:
        for p in r['players']:
            rosters[r['team']].append((p['name'], r['source'], {}))
    assert set(clubs) == set(rosters) and sum(map(len, rosters.values())) == 1145
    games = Counter(t['team'] for m in DATA['matches'] for t in m['teams'])
    seeds = {t['name']: t['nationals']['seed'] for t in DATA['teams'] if t.get('nationals')}
    # Solo il premio per avversaria: i contributi base sono già nei totali.
    bonus = Counter()
    for r in read_csv('USA-WOMEN-2026-NATIONALS-PARTITE.csv'):
        if seeds[r['opponent']] <= 4:
            contribution = int(r['goals']) + int(r['assists']) + 1.7 * int(r['blocks'])
            bonus[r['team'], key(r['player_as_listed'])] += .10 * contribution
    italy = json.loads((ROOT / 'src/30-js/37-leghe/00-dati-women.js').read_text().split('LN_PL.IW=')[1].split(';')[0])
    existing = {key(nm+' '+sur): (club, level) for club, rows in italy.items() for sur, nm, _, _, _, level in rows}
    audit, cards, club_rows, club_data = [], {}, [], []
    for club, c in sorted(clubs.items(), key=lambda item: -item[1]['rating']):
        entries = []
        for name, src, total in rosters[club]:
            p = people.get(key(name), {})
            canonical = p.get('name', name)
            match_key = key(total.get('nameAsListed', name))
            opponent = min(1.5, bonus[club, match_key])
            mod = evidence_for(canonical, club, p, total, games[club], opponent, evidence[key(canonical)])
            score = c['prior'] + mod['nationals'] + mod['opponent'] + mod['wucc']
            if mod['history_offset']:
                score = max(score, c['prior'] + mod['history_offset'])
            ov = round(max(mod['floor'], min(93, score)))
            status = 'in rosa'
            if key(name) in existing:
                old, ov = existing[key(name)]
                status = 'in ' + old
            elif name == 'Maia Nguyen':
                status = 'identità da verificare'
            measured = any(total.get(k) is not None for k in ('goals', 'assists', 'blocks'))
            external = bool(mod['references'] or mod['wucc'] or mod['history_supported'])
            confidence = ('alta' if measured and external else
                          'media' if measured or external else 'bassa')
            entries.append(dict(confidence=confidence, club=club, name=name, status=status, overall=ov, prior=c['prior'],
                                roster_source=src, **mod))
        # Le rose prive di ruoli richiedono portatrici per le linee consigliate.
        # Ogni supplenza è un profilo di gioco reversibile e ha lo stesso Overall.
        active = [e for e in entries if e['status'] == 'in rosa']
        handlers = sum(e['role'] == 'H' for e in active)
        unknown = sorted((e for e in active if e['role_basis'] == 'profilo di gioco'),
                         key=lambda e: stable('role|' + e['name']))
        for e in unknown[:max(0, round(len(active)*.32) - handlers)]:
            e['role'] = 'H'
        vals = sorted((e['overall'] for e in active), reverse=True)
        assert 7 <= len(vals) <= 28
        by_level = sorted(active, key=lambda e: -e['overall'])
        starters = [e for e in by_level if e['role'] == 'H'][:3]
        starters += [e for e in by_level if e['role'] != 'H'][:4]
        starters += [e for e in by_level if e not in starters][:7-len(starters)]
        top = round(mean(e['overall'] for e in starters), 1)
        padded = (vals + [max(25, min(vals)-8)] * 21)[:21]
        power = round(sum(w * mean(padded[i:i+7]) for w, i in [(0.6,0), (.35,7), (.05,14)]), 1)
        club_rows.append(dict(**c, entries=len(entries), playable=len(active), top7=top, power=power))
        club_data.append([club, REGIONS[c['region']], c['rating'], top])
        cards[club] = [[e['name'], e['role'], e['overall'], e['age'] if e['age_exact'] else -e['age']] for e in active]
        audit.extend(entries)
    audit.sort(key=lambda e: (e['club'], e['name']))
    write_csv('USA-WOMEN-2026-OVERALL.csv', audit)
    write_csv('USA-WOMEN-2026-CLUB.csv', club_rows)
    out = '/* Generato da tools/usa-women-2026.py. Metodo in docs/USA-WOMEN-2026-VALUTAZIONI.md. */\n'
    out += 'const UW_CLUBS=[\n' + ',\n'.join('  '+encode(r) for r in club_data) + '\n];\n'
    out += '// [nome, profilo, Overall, età al 20/11/2026 (negativa se stimata)]\nconst UW_ROSTERS={\n'
    out += ',\n'.join('  '+encode(c)+':'+encode(rows) for c, rows in cards.items()) + '\n};\n'
    (ROOT / 'src/30-js/35-usa/00-dati-women.js').write_text(out)


if __name__ == '__main__':
    generate()
