#!/usr/bin/env python3
"""
Pact places importer: Overture Maps open data -> the `places` table in Supabase.

What it does, per city:
  1. downloads every Overture place inside the city's bounding box (needs `pip install overturemaps`)
  2. keeps the kinds of place Pact suggests (restaurants, cafes, pubs, museums, parks, gyms, shops, ...)
  3. drops closed / low-confidence / duplicate places, scores the rest (independent, well-described places rank higher)
  4. writes places_<city>.csv  (you can upload it in the Supabase dashboard: Table Editor -> places -> Import data)
  5. optionally loads it straight into Supabase (--load)

Usage:
  python3 tools/import_places.py --city manchester                 # download + write CSV
  python3 tools/import_places.py --city all --load                 # all four cities, load into Supabase
  python3 tools/import_places.py --city london --file london.geojsonseq   # use a file you already downloaded
  python3 tools/import_places.py --city jakarta --inspect          # see which categories were/were not recognised

For --load set two environment variables first:
  SUPABASE_URL                 e.g. https://abcdefgh.supabase.co
  SUPABASE_SERVICE_ROLE_KEY    the SECRET key (never put it in the app or in GitHub)

Overture's current schema (Sept 2026 onwards) describes categories with `taxonomy` and `basic_category`;
the old `categories` field was removed. This script reads the new fields and falls back to the old one.
Data: Overture Maps Foundation (CDLA Permissive / Apache 2.0 for Foursquare-sourced records). Keep the credit line.
"""
import argparse, csv, json, os, re, shutil, subprocess, sys, urllib.error, urllib.parse, urllib.request
from collections import Counter

# bbox = west, south, east, north. min_conf = drop places Overture is less sure exist.
CITIES = {
    'manchester':   dict(name='Manchester',   country='United Kingdom', bbox=(-2.40, 53.35, -2.05, 53.58), min_conf=0.55),
    'peterborough': dict(name='Peterborough', country='United Kingdom', bbox=(-0.40, 52.50, -0.10, 52.65), min_conf=0.50),
    'london':       dict(name='London',       country='United Kingdom', bbox=(-0.30, 51.42, 0.05, 51.62),  min_conf=0.60),
    'jakarta':      dict(name='Jakarta',      country='Indonesia',      bbox=(106.70, -6.38, 107.00, -6.08), min_conf=0.40),
    'addisababa':   dict(name='Addis Ababa',  country='Ethiopia',       bbox=(38.65, 8.88, 38.90, 9.12),     min_conf=0.35),
    'oldenburg':    dict(name='Oldenburg',    country='Germany',        bbox=(8.10, 53.08, 8.32, 53.21),     min_conf=0.50),
}

# (category, kind, token phrases). A label like "pizza_restaurant" is split into tokens ["pizza","restaurant"];
# a phrase matches when its tokens appear next to each other. Rules are tried in order, most specific label first.
RULES = [
    ('Food', 'cafe',          ['cafe', 'coffee', 'tea_room', 'tea_house', 'espresso']),
    ('Food', 'bakery',        ['bakery', 'patisserie']),
    ('Food', 'dessert',       ['ice_cream', 'dessert', 'gelato', 'frozen_yogurt', 'chocolatier', 'donut', 'doughnut']),
    ('Food', 'pub',           ['pub', 'gastropub']),
    ('Food', 'bar',           ['bar', 'cocktail', 'beer_garden', 'brewery', 'taproom', 'lounge']),
    ('Food', 'restaurant',    ['restaurant', 'eatery', 'bistro', 'diner', 'pizzeria', 'steakhouse']),
    ('Indoor', 'museum',      ['museum']),
    ('Indoor', 'gallery',     ['art_gallery', 'gallery']),
    ('Indoor', 'cinema',      ['cinema', 'movie_theater', 'movie_theatre']),
    ('Indoor', 'theatre',     ['theatre', 'theater', 'performing_arts', 'music_venue', 'concert_hall', 'comedy_club', 'opera']),
    ('Indoor', 'arts_centre', ['arts_centre', 'art_center', 'cultural_center', 'cultural_centre']),
    ('Indoor', 'library',     ['library']),
    ('Indoor', 'fun_venue',   ['bowling', 'escape_room', 'arcade', 'mini_golf', 'laser_tag', 'trampoline']),
    ('Outdoor', 'fun_venue',  ['theme_park', 'amusement_park', 'water_park']),
    ('Outdoor', 'beach',      ['beach']),
    ('Outdoor', 'viewpoint',  ['viewpoint', 'lookout', 'scenic']),
    ('Outdoor', 'garden',     ['garden', 'botanical']),
    ('Outdoor', 'nature',     ['nature_reserve', 'nature', 'wildlife', 'forest', 'woodland']),
    ('Outdoor', 'trail',      ['trail', 'hiking']),
    ('Outdoor', 'park',       ['park', 'playground', 'recreation_ground']),
    ('Sports', 'climbing',    ['climbing']),
    ('Sports', 'pool',        ['swimming_pool', 'swimming', 'lido']),
    ('Sports', 'gym',         ['gym', 'fitness', 'yoga', 'pilates', 'martial_arts', 'boxing']),
    ('Sports', 'sports_centre', ['sports_centre', 'sports_center', 'sports_club', 'sports_complex', 'tennis', 'golf_course', 'leisure_centre', 'recreation_center']),
    ('Shopping', 'bookshop',  ['bookstore', 'book_store', 'bookshop']),
    ('Shopping', 'vintage_shop', ['thrift', 'vintage', 'second_hand', 'consignment', 'antique', 'antiques', 'flea']),
    ('Shopping', 'clothes',   ['clothing', 'fashion', 'boutique', 'shoe_store', 'shoes', 'menswear', 'womens_clothing', 'mens_clothing', 'sneaker']),
    ('Shopping', 'homeware',  ['furniture', 'home_goods', 'homewares', 'home_decor', 'home_decoration', 'interior_design', 'kitchen_supply', 'houseware', 'lighting_store']),
    ('Shopping', 'record_shop', ['record', 'records', 'vinyl', 'music_store']),
    ('Shopping', 'craft_shop', ['craft', 'art_supply', 'art_supplies', 'hobby']),
    ('Shopping', 'gift_shop', ['gift']),
    ('Shopping', 'market',    ['market', 'farmers_market']),
]
# Labels containing any of these are never imported (they contain a keyword above but are not what we want).
EXCLUDE = [['parking'], ['car', 'park'], ['trailer', 'park'], ['rv', 'park'], ['garden', 'center'], ['garden', 'centre'], ['garden', 'supply'],
           ['airport'], ['hotel'], ['lodging'], ['hospital'], ['school'], ['pet', 'store'], ['barber'],
           ['auction'], ['auction', 'house'], ['landscaping'], ['landscape'], ['nursery'], ['garden', 'furniture'], ['greenhouse'], ['funeral'], ['cemetery'],
           ['storage'], ['real', 'estate'], ['car', 'dealer'], ['automotive'], ['pawn'], ['wholesale'], ['warehouse'], ['office'], ['printing'], ['laundry'], ['dentist'],
           ['salon'], ['insurance'], ['bank'], ['church'], ['mosque'], ['temple']]
# A place whose NAME contains one of these is never imported (catches auction houses, garden centres etc. whatever their label says).
BAD_NAME = re.compile(r'\b(auctions?|auctioneers?|bidding|ebay|garden cent(?:re|er)s?|landscap\w*|nursery|nurseries|funeral|crematorium|cemetery|storage|estate agents?|pawn\w*|wholesale|scaffolding|plumbing|recruitment)\b', re.I)


def tokens(label):
    return [t for t in str(label).lower().split('_') if t]


def has_phrase(toks, phrase):
    n = len(phrase)
    return any(toks[i:i + n] == phrase for i in range(len(toks) - n + 1))


def labels_of(props):
    """Category labels for a place, most specific first. New schema first, old `categories` as a fallback."""
    tx = props.get('taxonomy') or {}
    old = props.get('categories') or {}
    out = []
    if tx.get('primary'): out.append(tx['primary'])
    if props.get('basic_category'): out.append(props['basic_category'])
    out += list(reversed(tx.get('hierarchy') or []))
    out += list(tx.get('alternates') or [])
    if old.get('primary'): out.append(old['primary'])
    out += list(old.get('alternate') or [])
    seen, res = set(), []
    for l in out:
        if l and l not in seen:
            seen.add(l); res.append(l)
    return res


def core_labels(props):
    """Only the place's own main label(s) and its parents. The long list of 'alternate' labels is ignored on purpose:
    that list is where an auction house ends up tagged as a garden."""
    tx = props.get('taxonomy') or {}
    old = props.get('categories') or {}
    out = []
    if tx.get('primary'): out.append(tx['primary'])
    if props.get('basic_category'): out.append(props['basic_category'])
    out += list(reversed(tx.get('hierarchy') or []))
    if old.get('primary'): out.append(old['primary'])
    seen, res = set(), []
    for l in out:
        if l and l not in seen:
            seen.add(l); res.append(l)
    return res


def classify(labels):
    """-> (category, kind) or None."""
    for lab in labels:
        toks = tokens(lab)
        if any(has_phrase(toks, e) for e in EXCLUDE):
            return None
    for lab in labels:
        toks = tokens(lab)
        for category, kind, phrases in RULES:
            if any(has_phrase(toks, tokens(p)) for p in phrases):
                return category, kind
    return None


def first(v):
    return v[0] if isinstance(v, list) and v else ''


def address_of(props):
    a = first(props.get('addresses')) or {}
    if not isinstance(a, dict): return '', ''
    parts = [a.get('freeform'), a.get('locality')]
    return ', '.join(str(x) for x in parts if x)[:200], str(a.get('postcode') or '')


def transform(path, city_key):
    cfg = CITIES[city_key]
    kept, stats = {}, Counter()
    unmapped = Counter()
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip().lstrip('\x1e')
            if not line: continue
            try:
                feat = json.loads(line)
            except ValueError:
                stats['bad json'] += 1; continue
            props = feat.get('properties') or feat   # tolerate flat records
            geom = feat.get('geometry') or {}
            stats['read'] += 1
            if geom.get('type') != 'Point' or len(geom.get('coordinates') or []) < 2:
                stats['no point'] += 1; continue
            lon, lat = geom['coordinates'][0], geom['coordinates'][1]
            w, so, e, no = cfg['bbox']
            if not (w <= lon <= e and so <= lat <= no):
                stats['outside the city area'] += 1; continue
            name = ((props.get('names') or {}).get('primary') or '').strip()
            if len(name) < 2:
                stats['no name'] += 1; continue
            if props.get('operating_status') in ('permanently_closed', 'temporarily_closed'):
                stats['closed'] += 1; continue
            conf = props.get('confidence')
            conf = 0.5 if conf is None else float(conf)
            if conf < cfg['min_conf']:
                stats['low confidence'] += 1; continue
            if BAD_NAME.search(name):
                stats['name looks like a business, not a place to visit'] += 1; continue
            labels = labels_of(props)
            hit = classify(core_labels(props) or labels)
            if not hit:
                stats['not a kind we suggest'] += 1
                if labels: unmapped[labels[0]] += 1
                continue
            category, kind = hit
            website, phone = first(props.get('websites')), first(props.get('phones'))
            address, postcode = address_of(props)
            q = 0.45 * conf + (0.2 if website else 0) + (0.1 if phone else 0) + (0.1 if address else 0) + (0.1 if props.get('socials') else 0)
            if props.get('brand'): q -= 0.3        # chains: fine to list, but independents are more interesting to discover
            q = round(max(0.0, min(1.0, q)), 3)
            tags, seen = [], set()
            for t in labels:
                t = str(t).lower()
                if t not in seen and ',' not in t and '"' not in t and '{' not in t:
                    seen.add(t); tags.append(t)
            row = dict(id='ovt:' + str(props.get('id') or feat.get('id')), source='overture', name=name[:200], category=category, kind=kind,
                       city=cfg['name'], country=cfg['country'], lat=round(lat, 6), lon=round(lon, 6), address=address,
                       website=str(website)[:300], phone=str(phone)[:40], confidence=round(conf, 3), quality=q, tags=tags[:10])
            key = (name.lower(), round(lat, 3), round(lon, 3))      # same name within ~100 m = same place
            if key not in kept or kept[key]['quality'] < q:
                kept[key] = row
            else:
                stats['duplicate'] += 1
    rows = list(kept.values())
    stats['kept'] = len(rows)
    return rows, stats, unmapped


COLS = ['id', 'source', 'name', 'category', 'kind', 'city', 'country', 'lat', 'lon', 'address', 'website', 'phone', 'confidence', 'quality', 'tags']


def write_csv(rows, path):
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(COLS)
        for r in rows:
            w.writerow([('{' + ','.join(r['tags']) + '}') if c == 'tags' else r[c] for c in COLS])


def download(city_key, dest):
    exe = shutil.which('overturemaps')
    if not exe:   # pip's Scripts folder is often missing from PATH on Windows: look next to Python itself
        for d in (os.path.join(os.path.dirname(sys.executable), 'Scripts'), os.path.join(os.path.dirname(sys.executable), 'bin')):
            for nm in ('overturemaps.exe', 'overturemaps'):
                if os.path.exists(os.path.join(d, nm)): exe = os.path.join(d, nm)
    if not exe:
        sys.exit('The `overturemaps` tool is missing. Install it with:  pip install overturemaps   (then run this again)')
    w, s, e, n = CITIES[city_key]['bbox']
    print(f'  downloading Overture places for {CITIES[city_key]["name"]} (a few minutes for big cities)...')
    subprocess.run([exe, 'download', f'--bbox={w},{s},{e},{n}', '-f', 'geojsonseq', '--type=place', '-o', dest], check=True)


def http(method, url, headers, body=None):
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status
    except urllib.error.HTTPError as ex:
        sys.exit(f'Supabase said {ex.code} for {method} {url.split("?")[0]}: {ex.read().decode("utf-8", "replace")[:300]}')


def load(rows, city_name):
    base = os.environ.get('SUPABASE_URL', '').rstrip('/')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    if not base or not key:
        sys.exit('For --load, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (the secret key) first.')
    headers = {'apikey': key, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}
    if not key.startswith('sb_'):                       # legacy service_role keys are JWTs and also go in Authorization
        headers['Authorization'] = 'Bearer ' + key
    # 1. mark this city's existing places inactive: anything not in this import stays hidden (closed since last time)
    http('PATCH', f'{base}/rest/v1/places?source=eq.overture&city=eq.{urllib.parse.quote(city_name)}', headers, json.dumps({'active': False}).encode())
    # 2. upsert the fresh rows
    up = dict(headers, Prefer='resolution=merge-duplicates,return=minimal')
    for i in range(0, len(rows), 500):
        batch = [dict(r, active=True) for r in rows[i:i + 500]]
        http('POST', f'{base}/rest/v1/places?on_conflict=id', up, json.dumps(batch).encode())
        print(f'  loaded {min(i + 500, len(rows))}/{len(rows)}')


def main():
    ap = argparse.ArgumentParser(description='Import Overture places for Pact')
    ap.add_argument('--city', required=True, help='manchester, peterborough, london, jakarta, or all')
    ap.add_argument('--file', help='use an already-downloaded .geojsonseq file instead of downloading (single city only)')
    ap.add_argument('--out-dir', default='places_out', help='where downloads and CSVs go (default: places_out)')
    ap.add_argument('--inspect', action='store_true', help='also show the most common categories we did NOT recognise')
    ap.add_argument('--load', action='store_true', help='load into Supabase after writing the CSV')
    a = ap.parse_args()
    keys = list(CITIES) if a.city == 'all' else [a.city.lower()]
    for k in keys:
        if k not in CITIES: sys.exit(f'Unknown city "{k}". Choose from: {", ".join(CITIES)}, all')
    if a.file and len(keys) != 1: sys.exit('--file works with one city at a time')
    os.makedirs(a.out_dir, exist_ok=True)
    for k in keys:
        print(f'== {CITIES[k]["name"]}')
        src = a.file or os.path.join(a.out_dir, f'overture_{k}.geojsonseq')
        if not a.file and not os.path.exists(src): download(k, src)
        rows, stats, unmapped = transform(src, k)
        out = os.path.join(a.out_dir, f'places_{k}.csv')
        write_csv(rows, out)
        print('  ' + ', '.join(f'{n}: {v}' for n, v in stats.items()))
        by = Counter(r['category'] for r in rows)
        print('  by category: ' + ', '.join(f'{c} {n}' for c, n in sorted(by.items())))
        print(f'  wrote {out}')
        if a.inspect:
            print('  most common categories NOT imported (add to RULES if any should be):')
            for lab, n in unmapped.most_common(25): print(f'    {n:6d}  {lab}')
        if a.load: load(rows, CITIES[k]['name'])
    print('Done.' + ('' if a.load else ' Upload the CSV in Supabase (Table Editor -> places -> Import data), or re-run with --load.'))


if __name__ == '__main__':
    main()
