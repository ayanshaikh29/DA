import os
import glob

def fix_string(s):
    try:
        # Encode as cp1252 (Windows-1252) which is how it was incorrectly read
        # Then decode as UTF-8 which is what it originally was
        return s.encode('cp1252').decode('utf-8')
    except:
        return s

test_str = "deliverables â€” posts"
try:
    print("Test string:", test_str)
    fixed = test_str.encode('cp1252').decode('utf-8')
    print("Fixed:", fixed)
except Exception as e:
    print("Error:", e)

# Also let's check exact bytes of a file
with open('C:/Users/HP/Desktop/Portfolios Ayan/DA/about.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("Found â€” in file?", "â€”" in content)

# Try fixing the whole file content
try:
    fixed_content = content.encode('cp1252').decode('utf-8')
    print("Successfully decoded entire file!")
except Exception as e:
    print("Could not decode entire file:", e)
