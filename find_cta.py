import os
import glob
import re

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'
html_files = glob.glob(os.path.join(ROOT, '*.html'))

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = re.finditer(r'<a[^>]*btn-magnetic[^>]*>', content)
    for m in matches:
        tag = m.group(0)
        if 'color:#FFFFFF !important' not in tag:
            print(f"File {os.path.basename(filepath)} has a btn-magnetic WITHOUT the inline style:")
            print(tag)
            print("---")
