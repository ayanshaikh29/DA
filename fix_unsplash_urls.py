import os
import re

def fix_unsplash_urls(directory):
    for root, dirs, files in os.walk(directory):
        if 'outputs' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Add &w=1600 to unsplash URLs that don't have a w parameter
                def replace_url(match):
                    url = match.group(0)
                    if '&w=' not in url and 'crop=' in url:
                        # if it's an avatar or small image, maybe w=400, but w=1600 is safe for everything
                        return url + '&w=1600'
                    return url

                new_content = re.sub(r'https://images\.unsplash\.com/photo-[a-zA-Z0-9\-]+[^"\s]+', replace_url, content)

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed Unsplash URLs in {filepath}")

fix_unsplash_urls('.')
