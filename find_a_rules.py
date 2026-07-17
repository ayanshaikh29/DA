import re

css_file = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/css/style.css'
with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

# find all blocks that have a selector starting with a or containing a
# This regex might be a bit tricky. Let's just look for "a {" or "a:" or "a." or ", a {" etc.
matches = re.findall(r'([^{}]+)\s*{[^}]*color\s*:[^}]+}', css)
for m in matches:
    selectors = [s.strip() for s in m.split(',')]
    for s in selectors:
        if s == 'a' or s.startswith('a:') or s.endswith(' a'):
            # let's print the whole block
            print("Found rule targeting 'a':", s)
