import os
import glob
import re

ROOT = 'C:/Users/HP/Desktop/Portfolios Ayan/DA'
CSS_FILE = os.path.join(ROOT, 'css', 'style.css')

# 1. Add Global CSS Rule
global_css = """
/* Global Testimonial Star Color Fix */
.testimonial-card svg[data-lucide="star"],
.testimonial-card i[class*="star"],
.testimonial-card .fa-star,
.client-review svg[data-lucide="star"],
.review-card svg[data-lucide="star"],
svg[data-lucide="star"] {
  fill: #FFB800 !important;
  color: #FFB800 !important;
}
"""

with open(CSS_FILE, 'r', encoding='utf-8') as f:
    css_content = f.read()

if "Global Testimonial Star Color Fix" not in css_content:
    with open(CSS_FILE, 'a', encoding='utf-8') as f:
        f.write("\n" + global_css)
    print("Added global CSS rule to style.css")

# 2. Fix HTML files
# We will use regex to find data-lucide="star" or similar and ensure they have fill-amber-400 text-amber-400
html_files = glob.glob(os.path.join(ROOT, '*.html'))

def fix_classes(match):
    # match.group(0) is the entire <i ...> or <svg ...> tag
    tag = match.group(0)
    
    # We want to replace text-gray-*, text-white/*, fill-none, etc with fill-amber-400 text-amber-400
    # Also remove any specific fill-[#...] or text-[#...]
    
    # Extract the class attribute
    class_match = re.search(r'class="([^"]*)"', tag)
    if not class_match:
        # If no class attribute, just add it
        return tag.replace('data-lucide="star"', 'data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"')
        
    classes = class_match.group(1).split()
    
    # Filter out any color-related classes
    new_classes = []
    for c in classes:
        if c.startswith('text-') and not c.startswith('text-['):
            # remove tailwind text colors
            continue
        if c.startswith('fill-') and not c.startswith('fill-['):
            # remove tailwind fill colors
            continue
        if 'text-[' in c or 'fill-[' in c:
            # remove custom colors
            continue
        if c == 'text-white' or c == 'text-black' or c == 'text-gray-400' or c == 'text-gray-500':
            continue
        new_classes.append(c)
        
    # Add gold classes
    new_classes.extend(['fill-amber-400', 'text-amber-400'])
    
    # Reconstruct the class attribute
    new_class_str = ' '.join(new_classes)
    new_tag = tag[:class_match.start(1)] + new_class_str + tag[class_match.end(1):]
    
    return new_tag

fixes = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all <i data-lucide="star" ... > or <svg data-lucide="star" ... > tags
    # It might span multiple lines, but usually on one line.
    new_content = re.sub(r'<(i|svg)[^>]*data-lucide="star"[^>]*>', fix_classes, content)
    
    # Also handle some font-awesome fa-star if they exist
    new_content = re.sub(r'<(i|svg)[^>]*fa-star[^>]*>', fix_classes, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        fixes += 1
        print(f"Updated star colors in {os.path.basename(filepath)}")

print(f"Finished. Modified {fixes} files.")
