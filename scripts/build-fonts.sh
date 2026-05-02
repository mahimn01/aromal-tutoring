#!/usr/bin/env bash
# Re-fetch Latin-subset woff2 files from Google Fonts and self-host.
# Run this only if you change which weights/families are needed.
set -euo pipefail

cd "$(dirname "$0")/../assets/fonts"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Fetch Google Fonts CSS for each family (Latin only)
curl -sH "User-Agent: $UA" \
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&display=swap" \
  > _fraunces.css
curl -sH "User-Agent: $UA" \
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" \
  > _instrument.css
curl -sH "User-Agent: $UA" \
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300..500&display=swap" \
  > _jetbrains.css

python3 - <<'PY'
import re, urllib.request, os
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

def parse_blocks(css):
    pattern = re.compile(r'/\*\s*(\S+)\s*\*/\s*@font-face\s*\{([^}]+)\}', re.DOTALL)
    for m in pattern.finditer(css):
        subset, body = m.group(1), m.group(2)
        family = re.search(r"font-family:\s*'([^']+)'", body).group(1)
        style  = re.search(r"font-style:\s*(\w+)", body).group(1)
        weight = re.search(r"font-weight:\s*([0-9 ]+)", body).group(1).strip()
        src    = re.search(r"src:\s*url\(([^)]+)\)", body).group(1)
        urange = re.search(r"unicode-range:\s*([^;]+)", body).group(1).strip()
        yield subset, family, style, weight, src, urange

for css_file in ['_fraunces.css', '_instrument.css', '_jetbrains.css']:
    css = open(css_file).read()
    for subset, family, style, weight, src, urange in parse_blocks(css):
        if subset != 'latin': continue
        slug = family.lower().replace(' ', '-')
        fn = f"{slug}-{style}-{weight.replace(' ','-')}.woff2"
        req = urllib.request.Request(src, headers={'User-Agent': UA})
        with urllib.request.urlopen(req) as r, open(fn, 'wb') as f:
            f.write(r.read())
        print(f'  ↓ {fn}  ({os.path.getsize(fn)} bytes)')

# Print the @font-face block to paste into index.html if you change anything
print('\nUpdate the @font-face block at the top of index.html\'s <style> if needed.')
PY

rm -f _fraunces.css _instrument.css _jetbrains.css
