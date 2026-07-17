import os
import glob
import re

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'

html_files = glob.glob(os.path.join(ROOT, '*.html'))

def fix_inline_svg_stars(match):
    tag = match.group(0)
    
    # We want to replace whatever class it has with fill-amber-400 text-amber-400
    class_match = re.search(r'class="([^"]*)"', tag)
    if not class_match:
        return tag.replace('<svg', '<svg class="fill-amber-400 text-amber-400"')
        
    classes = class_match.group(1).split()
    
    new_classes = []
    for c in classes:
        if c.startswith('text-') or c.startswith('fill-'):
            continue
        new_classes.append(c)
        
    new_classes.extend(['fill-amber-400', 'text-amber-400'])
    
    new_class_str = ' '.join(new_classes)
    new_tag = tag[:class_match.start(1)] + new_class_str + tag[class_match.end(1):]
    
    return new_tag

fixes = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Match an SVG that contains the star path
    # Regex breakdown:
    # <svg[^>]*> : Match <svg ... >
    # \s* : Optional whitespace
    # <path d="M9\.049 2\.927 : Match the beginning of the star path
    # [^>]*> : Match rest of path tag
    # \s*</svg> : Match closing tag
    
    # Actually some might not have \s* between tags. Let's just match the whole thing flexibly.
    pattern = r'<svg[^>]*>\s*<path d="M9\.049 2\.927[^>]*>\s*</svg>'
    
    new_content = re.sub(pattern, fix_inline_svg_stars, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        fixes += 1
        print(f"Fixed inline SVG stars in {os.path.basename(filepath)}")
        
        # Also update the copy in outputs just in case
        output_path = os.path.join(ROOT, 'outputs', os.path.basename(filepath))
        if os.path.exists(output_path):
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

print(f"Finished. Modified {fixes} files.")
