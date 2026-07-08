"""
FINAL comprehensive mojibake analysis.
Produces: byte patterns, frequencies, contexts, decode attempts, and replacement map.
"""
import os, sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'
HTML_FILES = [f for f in os.listdir(ROOT) if f.endswith('.html') and f != 'thank-you.html']

WIN1252 = {
    0x80:0x20AC,0x82:0x201A,0x83:0x0192,0x84:0x201E,0x85:0x2026,
    0x86:0x2020,0x87:0x2021,0x88:0x02C6,0x89:0x2030,0x8A:0x0160,
    0x8B:0x2039,0x8C:0x0152,0x8E:0x017D,0x91:0x2018,0x92:0x2019,
    0x93:0x201C,0x94:0x201D,0x95:0x2022,0x96:0x2013,0x97:0x2014,
    0x98:0x02DC,0x99:0x2122,0x9A:0x0161,0x9B:0x203A,0x9C:0x0153,
    0x9E:0x017E,0x9F:0x0178,
}
WIN1252_REV = {v: k for k, v in WIN1252.items()}


def corrupt(char, levels):
    utf8 = char.encode('utf-8')
    for _ in range(levels):
        chars = []
        for b in utf8:
            chars.append(chr(WIN1252[b]) if b in WIN1252 else chr(b))
        result = bytearray()
        for ch in chars:
            result.extend(ch.encode('utf-8'))
        utf8 = result
    return bytes(utf8)


def reverse_levels(text, max_levels=10):
    results = [text]
    current = text
    for _ in range(max_levels):
        raw = bytearray()
        ok = True
        for ch in current:
            cp = ord(ch)
            if cp < 256:
                raw.append(cp)
            elif cp in WIN1252_REV:
                raw.append(WIN1252_REV[cp])
            else:
                ok = False
                break
        if not ok or not raw:
            break
        try:
            decoded = raw.decode('utf-8')
        except:
            decoded = raw.decode('utf-8', errors='replace')
            results.append(decoded)
            break
        results.append(decoded)
        current = decoded
        if all(ord(c) < 128 for c in decoded):
            break
    return results


# Collect patterns
all_patterns = Counter()
file_hits = {}
for fname in HTML_FILES:
    data = open(os.path.join(ROOT, fname), 'rb').read()
    hits = []
    i = 0
    while i < len(data):
        if data[i] >= 0x80:
            start = i
            while i < len(data) and data[i] >= 0x80:
                i += 1
            seg = data[start:i]
            if 0xC3 in seg and len(seg) >= 2:
                all_patterns[seg] += 1
                hits.append((start, seg))
        else:
            i += 1
    if hits:
        file_hits[fname] = hits


# Build corruption lookup
SPECIAL = {
    '\u2014': 'em-dash', '\u2013': 'en-dash', '\u00d7': 'multiply',
    '\u00b7': 'middot', '\u20b9': 'rupee', '\u2019': 'rsquote',
    '\u2018': 'lsquote', '\u201c': 'ldquote', '\u201d': 'rdquote',
    '\u2026': 'ellipsis', '\u2022': 'bullet', '\u2122': 'trademark',
    '\u00a9': 'copyright', '\u00ae': 'regsign', '\u00b0': 'degree',
    '\u00ba': 'ord-masc', '\u00aa': 'ord-fem', '\u00bf': 'inv-question',
    '\u00a1': 'inv-excl', '\u2020': 'dagger', '\u2021': 'dbl-dagger',
    '\u203a': 'rdsaquo', '\u2039': 'ldsaquo', '\u0153': 'oe',
    '\u0152': 'OE', '\u0160': 'Scaron', '\u017d': 'Zcaron',
    '\u0161': 'scaron', '\u017e': 'z-caron', '\u0178': 'Y-diaeresis',
    '\u0192': 'fhook', '\u2030': 'permille', '\u20ac': 'euro',
    '\u00a3': 'pound', '\u00a5': 'yen',
}
corruption_table = {}
for char, name in SPECIAL.items():
    for level in range(1, 8):
        c = corrupt(char, level)
        if c not in corruption_table:
            corruption_table[c] = (name, char, level)

# ==================== OUTPUT ====================
print("=" * 90)
print("MOJIBAKE ANALYSIS RESULTS")
print("=" * 90)
print(f"\nTotal distinct patterns: {len(all_patterns)}")
print(f"Total occurrences: {sum(all_patterns.values())}")

# Per-file summary
print("\n--- PER-FILE BREAKDOWN ---")
for fname in sorted(file_hits.keys()):
    hits = file_hits[fname]
    pat_counter = Counter()
    for _, seg in hits:
        pat_counter[seg] += 1
    print(f"  {fname}: {len(hits)} occurrences, {len(pat_counter)} distinct patterns")
    for seg, cnt in pat_counter.most_common():
        endhex = ' '.join(f'{b:02X}' for b in seg[-6:])
        print(f"    {cnt:>4}x  ({len(seg):>3} bytes, ends ...{endhex})")

# Pattern analysis
print("\n--- PATTERN DETAILS ---")
for idx, (pat, count) in enumerate(all_patterns.most_common(100), 1):
    print(f"\n{'='*90}")
    print(f"PATTERN #{idx}  |  Count: {count}  |  Size: {len(pat)} bytes")
    print(f"{'='*90}")
    
    # Full hex dump (40 bytes per line)
    hx = [f'{b:02X}' for b in pat]
    for ci in range(0, len(hx), 20):
        print(f"  {' '.join(hx[ci:ci+20])}")
    
    # UTF-8 decoded
    text = pat.decode('utf-8', errors='replace')
    codepoints = [f'U+{ord(c):04X}' for c in text]
    print(f"  UTF-8 chars ({len(text)}): {' '.join(codepoints[:20])}" + 
          (f" ... +{len(codepoints)-20} more" if len(codepoints) > 20 else ""))
    
    # Match against corruption table
    if pat in corruption_table:
        name, char, lvl = corruption_table[pat]
        print(f"  >>> EXACT MATCH: {name} ({repr(char)}) corrupted {lvl} levels")
    else:
        # Try partial matches: does the pattern START with a known corruption?
        best_match = None
        for known, (name, char, lvl) in corruption_table.items():
            if len(known) < len(pat) and pat[:len(known)] == known:
                if best_match is None or len(known) > len(best_match[0]):
                    best_match = (known, name, char, lvl)
        if best_match:
            known, name, char, lvl = best_match
            remainder = pat[len(known):]
            print(f"  >>> STARTS WITH: {name} ({repr(char)}) L{lvl} ({len(known)} bytes)")
            if remainder in corruption_table:
                n2, c2, l2 = corruption_table[remainder]
                print(f"  >>> FOLLOWED BY: {n2} ({repr(c2)}) L{l2} ({len(remainder)} bytes)")
                print(f"  >>> RECOMMENDED REPLACEMENT: {repr(char + c2)}")
            else:
                print(f"  >>> REMAINDER ({len(remainder)} bytes) unknown")
                rem_text = remainder.decode('utf-8', errors='replace')
                print(f"     Remainder UTF-8: {repr(rem_text)}")
        else:
            # Try reverse decode
            rev = reverse_levels(text)
            clean = rev[-1] if rev else ''
            is_clean = all(ord(c) < 128 for c in clean) if clean else False
            if is_clean and clean:
                print(f"  >>> REVERSED through {len(rev)-1} levels to: {repr(clean)}")
            else:
                # Check if pattern is a repetition of a known corruption unit
                found_rep = False
                for known, (name, char, lvl) in corruption_table.items():
                    if len(known) < len(pat):
                        n_reps = len(pat) / len(known)
                        if n_reps == int(n_reps) and pat == known * int(n_reps):
                            reps = int(n_reps)
                            print(f"  >>> {reps}x repeated: {name} ({repr(char)}) L{lvl}")
                            print(f"  >>> RECOMMENDED: {repr(char * reps)}")
                            found_rep = True
                            break
                if not found_rep:
                    print(f"  >>> NO MATCH found in corruption table")
                    # Show last 2 levels of reverse attempt
                    for li, lv in enumerate(rev[-3:]):
                        clean_count = sum(1 for c in lv if ord(c) < 128)
                        print(f"     Reverse L{li}: {clean_count}/{len(lv)} ASCII chars")
    
    # Show files this appears in
    appearing_files = []
    for fname, hits in file_hits.items():
        for _, seg in hits:
            if seg == pat:
                appearing_files.append(fname)
    if appearing_files:
        print(f"  Files: {', '.join(sorted(set(appearing_files)))}")

# Final replacement map
print(f"\n{'='*90}")
print("RECOMMENDED BYTE-LEVEL REPLACEMENT MAP")
print("(For use in fix_all_encoding.py)")
print(f"{'='*90}\n")

for pat, count in all_patterns.most_common(100):
    hex_bytes = ' '.join(f'{b:02X}' for b in pat)
    
    if pat in corruption_table:
        name, char, lvl = corruption_table[pat]
        print(f"  # {count}x ({len(pat)} bytes) -> {name} ({repr(char)})")
        print(f"  HEX: {hex_bytes}")
        print(f"  -> replace with: {repr(char)}")
        print()
    else:
        # Check repeated
        found = False
        for known, (name, char, lvl) in corruption_table.items():
            if len(known) < len(pat) and len(pat) % len(known) == 0:
                n = len(pat) // len(known)
                if pat == known * n:
                    print(f"  # {count}x ({len(pat)} bytes) -> {n}x {name} ({repr(char)})")
                    print(f"  HEX: {hex_bytes}")
                    print(f"  -> replace with: {repr(char * n)}")
                    print()
                    found = True
                    break
        if not found:
            # Check prefix match
            for known, (name, char, lvl) in sorted(corruption_table.items(), key=lambda x: -len(x[0])):
                if len(known) < len(pat) and pat[:len(known)] == known:
                    remainder = pat[len(known):]
                    if remainder in corruption_table:
                        n2, c2, l2 = corruption_table[remainder]
                        print(f"  # {count}x ({len(pat)} bytes) -> {name} + {n2}")
                        print(f"  HEX: {hex_bytes}")
                        print(f"  -> replace with: {repr(char + c2)}")
                        print()
                        found = True
                        break
            if not found:
                print(f"  # {count}x ({len(pat)} bytes) -> UNKNOWN")
                print(f"  HEX: {hex_bytes}")
                print(f"  -> ??? (context analysis needed)")
                print()
