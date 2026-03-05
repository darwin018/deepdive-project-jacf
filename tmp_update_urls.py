import os

target_dir = r"d:\deepdive-project\frontend\deepdive\src\Components"
urls_to_replace = ["http://localhost:8000", "http://127.0.0.1:8000"]
new_url = "https://testapp-50039367885.development.catalystappsail.in"

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith((".js", ".jsx")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            updated = False
            for url in urls_to_replace:
                if url in content:
                    content = content.replace(url, new_url)
                    updated = True
            
            if updated:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
