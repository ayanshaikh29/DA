import os
import re

index_path = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The pattern looks like:
# <span                                class="font-display text-sm font-semibold text-slate-300 group-hover:text-blue-600 transition-colors">01</span>

# We want to remove the spans for 01, 02, 03, 04, 05
pattern = r'<span[^>]*class="font-display[^>]*>0[1-5]</span>'

new_content = re.sub(pattern, '', content)

if new_content != content:
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully removed the numbers from index.html")
    
    # Update outputs/index.html as well
    out_path = 'C:/Users/HP/Desktop/Portfolios Ayan/DA/outputs/index.html'
    if os.path.exists(out_path):
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated outputs/index.html")
else:
    print("Could not find the pattern in index.html")
