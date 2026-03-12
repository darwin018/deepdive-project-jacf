import os, glob, re

css_dir = r"d:\deepdive-project\frontend\deepdive\src\css"
files = glob.glob(os.path.join(css_dir, "*.css"))

def replace_theme(content):
    # Backgrounds
    content = re.sub(r'background-color:\s*#0B0B0B', 'background-color: #FAFAFA', content, flags=re.IGNORECASE)
    content = re.sub(r'background-color:\s*#111111', 'background-color: #F5F5F5', content, flags=re.IGNORECASE)
    content = re.sub(r'background-color:\s*#1C1C1C', 'background-color: #FFFFFF', content, flags=re.IGNORECASE)
    content = re.sub(r'background-color:\s*#2A2A2A', 'background-color: #FEEE91', content, flags=re.IGNORECASE)
    
    # Gradients / Box-shadow / rgb / rgba references
    content = re.sub(r'#0B0B0B', '#FAFAFA', content, flags=re.IGNORECASE)
    content = re.sub(r'#111111', '#F5F5F5', content, flags=re.IGNORECASE)
    content = re.sub(r'#1C1C1C', '#FFFFFF', content, flags=re.IGNORECASE)
    content = re.sub(r'#2A2A2A', '#FEEE91', content, flags=re.IGNORECASE)
    
    # Borders
    content = re.sub(r'#3A3A3A', '#E5E7EB', content, flags=re.IGNORECASE)
    
    # Text colors
    content = re.sub(r'color:\s*#B5B5B5', 'color: #6B7280', content, flags=re.IGNORECASE)
    content = re.sub(r'color:\s*#CCCCCC', 'color: #6B7280', content, flags=re.IGNORECASE)
    content = re.sub(r'color:\s*#FFFFFF', 'color: #1F2937', content, flags=re.IGNORECASE)
    content = re.sub(r'color:\s*white', 'color: #1F2937', content, flags=re.IGNORECASE)
    
    # Teals
    content = re.sub(r'#00D2BE', '#FFA239', content, flags=re.IGNORECASE)
    content = re.sub(r'#00B3A4', '#E68924', content, flags=re.IGNORECASE)
    content = re.sub(r'rgba\(0,\s*210,\s*190,', 'rgba(255, 162, 57,', content)
    
    # Red badges
    content = re.sub(r'#EF4444', '#FF5656', content, flags=re.IGNORECASE)
    
    return content

# Special Button fixing regexes
buttons = [
    r"(\.heroButton[^{]*\{)([^}]+)(\})",
    r"(\.addToCartBtn[^{]*\{)([^}]+)(\})",
    r"(\.addToCartButton[^{]*\{)([^}]+)(\})",
    r"(\.offerButton[^{]*\{)([^}]+)(\})",
    r"(\.checkoutButton[^{]*\{)([^}]+)(\})",
    r"(\.finalCheckoutButton[^{]*\{)([^}]+)(\})",
    r"(\.viewBtn[^{]*\{)([^}]+)(\})",
    r"(\.submitButton[^{]*\{)([^}]+)(\})"
]

def fix_buttons(content):
    for btn in buttons:
        def rep(m):
            inner = m.group(2)
            # Make background red
            inner = re.sub(r'#FFA239', '#FF5656', inner, flags=re.IGNORECASE)
            # Make hover dark red
            inner = re.sub(r'#E68924', '#E04444', inner, flags=re.IGNORECASE)
            # Make text white
            inner = re.sub(r'color:\s*#1F2937', 'color: #FFFFFF', inner, flags=re.IGNORECASE)
            inner = re.sub(r'color:\s*#000000', 'color: #FFFFFF', inner, flags=re.IGNORECASE)
            return m.group(1) + inner + m.group(3)
        content = re.sub(btn, rep, content)
    return content

# files to skip (already customized manually)
skip_files = ['Navbar.module.css', 'Sidebar.module.css']

for f in files:
    if any(s in f for s in skip_files):
        print(f"Skipping {f}")
        continue
        
    with open(f, 'r', encoding='utf-8') as file:
        css = file.read()
        
    css = replace_theme(css)
    css = fix_buttons(css)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(css)
    
    print(f"Updated {f}")
