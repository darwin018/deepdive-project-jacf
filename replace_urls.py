import os
import glob

directory = r'd:\deepdive-project\frontend\deepdive\src\Components'
backend_url = 'https://demoapp-50039367885.development.catalystappsail.in'

count = 0
for filepath in glob.glob(f"{directory}/*.jsx"):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('http://localhost:8000', backend_url)
    new_content = new_content.replace('http://127.0.0.1:8000', backend_url)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f"Updated {filepath}")

print(f"Total updated: {count}")
