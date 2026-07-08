"""
Comprehensive mojibake fix for all HTML files.
Finds and replaces ALL multi-level encoding corruption patterns.
"""
import os
import re

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'

HTML_FILES = [f for f in os.listdir(ROOT) if f.endswith('.html') and f != 'thank-you.html']

# Build mojibake → clean replacement map
# These are the CORRUPTED UTF-8 text patterns and their correct replacements.
# Each pattern is the result of multi-level UTF-8 ↔ Win-1252 encoding cycles.
REPLACEMENTS = {
    # === EM-DASH — (U+2014) ===
    # Triple-level corruption of — 
    'ÃƒÆ\x80Ã¢â‚¬Ã¢Â¢Ã¢â€šÂ¬Ã¢Â Â¡Ã¢â€šÃ‚Â¢ÃƒÆ\x80Ã¢â‚¬Ã¢Â¢Ã¢â€šÂ¬Ã¢Â Â¡Ã¢â€šÃ‚Â¢ÃƒÆ\x80Ã¢â‚¬Ã¢Â¢Ã¢â€šÂ¬Ã¢Â Â¡Ã¢â€šÃ‚Â¢': '—',
    # Common triple-level pattern seen in files
    'ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ãƒâ€šÃ‚Â¢': '—',
    # The actual pattern from the grep output (triple-encoded em-dash)
    'ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢': '—',
    # The exact pattern from case-studies (spice route, etc.)
    'ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢': '—',
    # The exact pattern from the grep (ÃƒÆ'Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â)
    'ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ\u2018Ã¢â‚¬Ã…Â¸Ã¢â‚¬Å¡Ã¢â€šÃ‚Â¢': '—',
}

def get_mojibake_patterns():
    """Build comprehensive mojibake patterns from known clean characters."""
    patterns = {}
    
    # Em-dash — (U+2014)
    # Clean UTF-8: E2 80 94
    # Multi-level corruption produces various patterns. Let me simulate them.
    clean_emdash = '\u2014'  # —
    clean_multiply = '\u00d7'  # ×
    clean_middot = '\u00b7'  # ·
    clean_rupee = '\u20b9'  # ₹
    clean_endash = '\u2013'  # –
    clean_ndash = '\u2013'  # –
    clean_apostrophe = '\u2019'  # ' (right single quotation mark)
    clean_ldquote = '\u201c'  # " (left double quotation mark)
    clean_rdquote = '\u201d'  # " (right double quotation mark)
    clean_ellipsis = '\u2026'  # …
    clean_bullet = '\u2022'  # •
    clean_trademark = '\u2122'  # ™
    clean_copyright = '\u00a9'  # ©
    clean_regsign = '\u00ae'  # ®
    
    return patterns

def build_replacement_map():
    """
    Build a comprehensive byte-level replacement map by simulating
    multi-level Win-1252 encoding corruption for each special character.
    """
    import codecs
    
    # Win-1252 decode table: maps byte values to Unicode code points
    # Only the 128-255 range is different from ISO-8859-1
    win1252_map = {
        0x80: '\u20ac', 0x82: '\u201a', 0x83: '\u0192', 0x84: '\u201e',
        0x85: '\u2026', 0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02c6',
        0x89: '\u2030', 0x8a: '\u0160', 0x8b: '\u2039', 0x8c: '\u0152',
        0x8e: '\u017d', 0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201c',
        0x94: '\u201d', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
        0x98: '\u02dc', 0x99: '\u2122', 0x9a: '\u0161', 0x9b: '\u203a',
        0x9c: '\u0153', 0x9e: '\u017e', 0x9f: '\u0178',
    }
    
    def win1252_decode(char):
        """Get the Win-1252 byte value for a character, or None."""
        cp = ord(char)
        if cp < 128:
            return bytes([cp])
        if cp in win1252_map:
            # Find the byte value that maps to this code point
            for byte_val, unicode_val in win1252_map.items():
                if unicode_val == char:
                    return bytes([byte_val])
        # Try ISO-8859-1 (same as Win-1252 for 160-255)
        if 0xa0 <= cp <= 0xff:
            return bytes([cp])
        return None
    
    def simulate_corruption(clean_char, levels=3):
        """Simulate N levels of Win-1252 encoding corruption."""
        # Get the clean UTF-8 bytes
        clean_bytes = clean_char.encode('utf-8')
        
        current = clean_bytes
        for level in range(levels):
            # Read each byte as Win-1252 character, then encode as UTF-8
            result = bytearray()
            for byte_val in current:
                # Get the Win-1252 character for this byte
                if byte_val < 128:
                    char = chr(byte_val)
                elif byte_val in win1252_map:
                    char = win1252_map[byte_val]
                else:
                    char = chr(byte_val)  # ISO-8859-1 compatibility
                # Encode as UTF-8
                result.extend(char.encode('utf-8'))
            current = bytes(result)
        
        return current
    
    # Build replacement map for each special character
    replacement_map = {}
    
    special_chars = {
        '\u2014': 'em-dash',
        '\u2013': 'en-dash',
        '\u00d7': 'multiplication',
        '\u00b7': 'middle-dot',
        '\u20b9': 'rupee',
        '\u2019': 'apostrophe',
        '\u201c': 'ldquote',
        '\u201d': 'rdquote',
        '\u2026': 'ellipsis',
        '\u2022': 'bullet',
        '\u2122': 'trademark',
        '\u00a9': 'copyright',
        '\u00ae': 'regsign',
    }
    
    for char, name in special_chars.items():
        # Simulate 2, 3, and 4 levels of corruption
        for levels in [2, 3, 4]:
            corrupted = simulate_corruption(char, levels)
            if corrupted not in replacement_map:
                replacement_map[corrupted] = char
                print(f"  {name} L{levels}: {corrupted.hex()} -> U+{ord(char):04X}", flush=True)
    
    return replacement_map


def fix_file(filepath, replacement_map):
    """Fix mojibake in a single file."""
    with open(filepath, 'rb') as f:
        data = f.read()
    
    original_len = len(data)
    total_fixes = 0
    
    # Sort by length (longest first) to avoid partial matches
    sorted_patterns = sorted(replacement_map.keys(), key=len, reverse=True)
    
    for corrupted_bytes in sorted_patterns:
        clean_bytes = replacement_map[corrupted_bytes].encode('utf-8')
        count = data.count(corrupted_bytes)
        if count > 0:
            data = data.replace(corrupted_bytes, clean_bytes)
            total_fixes += count
    
    if total_fixes > 0:
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"  {os.path.basename(filepath)}: {total_fixes} fixes ({original_len} -> {len(data)} bytes)")
        return total_fixes
    return 0


def main():
    print("Building mojibake replacement map...")
    replacement_map = build_replacement_map()
    print(f"\nGenerated {len(replacement_map)} replacement patterns\n")
    
    total = 0
    for fname in HTML_FILES:
        filepath = os.path.join(ROOT, fname)
        fixes = fix_file(filepath, replacement_map)
        total += fixes
    
    # Also fix CSS and JS
    for extra in ['css/style.css', 'js/navbar.js']:
        filepath = os.path.join(ROOT, extra)
        if os.path.exists(filepath):
            fixes = fix_file(filepath, replacement_map)
            total += fixes
    
    print(f"\nTotal fixes across project: {total}")


if __name__ == '__main__':
    main()
