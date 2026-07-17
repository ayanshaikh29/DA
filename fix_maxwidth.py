import os
import re

css_path = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/css/style.css'

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace `100vw` with `100%` anywhere it appears in a line with `max-width`
lines = content.split('\n')
modified = False
for i, line in enumerate(lines):
    if 'max-width' in line and '100vw' in line:
        lines[i] = line.replace('100vw', '100%')
        modified = True

if modified:
    new_content = '\n'.join(lines)
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced 100vw with 100% in max-width declarations.")
    
    # Update outputs copy
    out_path = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/outputs/css/style.css'
    if os.path.exists(out_path):
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated outputs/css/style.css as well.")
else:
    print("No matches found for replacement.")
