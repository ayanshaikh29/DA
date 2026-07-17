import os
import re

def fix_html_issues(directory):
    for root, dirs, files in os.walk(directory):
        if 'outputs' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix 1: Add rel="noopener noreferrer" to target="_blank"
                # Find <a ... target="_blank" ... > without rel="noopener noreferrer"
                
                def fix_target_blank(match):
                    a_tag = match.group(0)
                    if 'rel=' not in a_tag:
                        return a_tag.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
                    elif 'noopener' not in a_tag or 'noreferrer' not in a_tag:
                        # simple heuristic: if rel exists but doesn't have both, just replace the whole rel or append to it. 
                        # for safety, let's just do a regex replace if rel is missing it.
                        if 'rel="' in a_tag:
                            a_tag = re.sub(r'rel="([^"]*)"', r'rel="\1 noopener noreferrer"', a_tag)
                            # remove duplicate noopeners just in case
                            a_tag = a_tag.replace('noopener noopener', 'noopener').replace('noreferrer noreferrer', 'noreferrer')
                            return a_tag
                    return a_tag

                # Match a tag containing target="_blank"
                new_content = re.sub(r'<a\s+[^>]*target="_blank"[^>]*>', fix_target_blank, content, flags=re.IGNORECASE)

                # Fix 2: Spaces in image paths.
                # src="assets/client logos/1.jpeg" -> src="assets/client%20logos/1.jpeg"
                def fix_src_spaces(match):
                    src_val = match.group(1)
                    if ' ' in src_val and not src_val.startswith('http'):
                        new_src = src_val.replace(' ', '%20')
                        return f'src="{new_src}"'
                    return match.group(0)

                new_content = re.sub(r'src="([^"]+)"', fix_src_spaces, new_content)

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed issues in {filepath}")

fix_html_issues('.')
