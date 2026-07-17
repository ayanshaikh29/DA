import re

css_file = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/css/style.css'
with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

matches = re.findall(r'([^}{]*?)\s*{\s*[^}]*?color\s*:[^;}]+!important[^}]*}', css, flags=re.DOTALL | re.IGNORECASE)

for m in matches:
    # Just print the selector to see what is getting !important color
    sel = m.strip().replace('\n', ' ')
    if sel:
        print(sel[:200])
