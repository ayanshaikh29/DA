import os
import glob
import shutil

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'
OUTPUTS = os.path.join(ROOT, 'outputs')

if not os.path.exists(OUTPUTS):
    os.makedirs(OUTPUTS)

chars_to_fix = [
    '—', '’', '₹', '“', '”', '–', '★', '©', '®', '…', '•', '™', '×', '·', '─', '▾', '↗', '☰'
]

# Build replacement map
replacements = {}
for char in chars_to_fix:
    try:
        # What it looks like after being double-encoded:
        bad_str = char.encode('utf-8').decode('cp1252')
        # Only add to replacements if it's actually corrupted (different)
        if bad_str != char:
            replacements[bad_str] = char
    except UnicodeDecodeError:
        pass

# Add a few manual ones just in case decode failed for some reason
manual_replacements = {
    'â€”': '—',
    'â€™': '’',
    'â‚¹': '₹',
    'â€œ': '“',
    'â€ ': '”',
    'â€“': '–',
    'â˜…': '★',
    'Â©': '©',
    'Â®': '®',
    'â€¦': '…',
    'â€¢': '•',
    'â„¢': '™',
    'Ã—': '×',
    'Â·': '·',
    'â”€': '─',
    'â–¾': '▾',
    'â†—': '↗',
    'â˜°': '☰'
}

for bad, good in manual_replacements.items():
    replacements[bad] = good

print(f"Built {len(replacements)} replacements.")

# Find all files
files_to_check = []
for ext in ('*.html', 'css/*.css', 'js/*.js'):
    files_to_check.extend(glob.glob(os.path.join(ROOT, ext)))

total_fixes = 0
for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixes_in_file = 0
    # Sort replacements by length descending to avoid partial replacements
    for bad_str in sorted(replacements.keys(), key=len, reverse=True):
        if bad_str in content:
            fixes_in_file += content.count(bad_str)
            content = content.replace(bad_str, replacements[bad_str])
            
    if fixes_in_file > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {fixes_in_file} occurrences in {os.path.basename(filepath)}")
        total_fixes += fixes_in_file
        
    # Copy to outputs
    rel_path = os.path.relpath(filepath, ROOT)
    out_path = os.path.join(OUTPUTS, rel_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    shutil.copy2(filepath, out_path)
    
print(f"Total fixes applied: {total_fixes}")
print("All files copied to outputs directory.")
