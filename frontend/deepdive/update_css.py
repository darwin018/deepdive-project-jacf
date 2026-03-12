import os
import glob
import re

css_dir = r"d:\deepdive-project\frontend\deepdive\src\css"
css_files = glob.glob(os.path.join(css_dir, "*.css"))

color_map = {
    "#0B0B0B": "#FAFAFA", # Primary Background
    "#111111": "#F5F5F5", # Primary Background (Alt)
    "#1C1C1C": "#FFFFFF", # Surfaces / Cards
    "#2A2A2A": "#FEEE91", # Surfaces Hover
    "#3A3A3A": "#E5E7EB", # Borders
    "#B5B5B5": "#6B7280", # Text Secondary
    "#CCCCCC": "#6B7280", # Text Secondary
    "#EF4444": "#FF5656", # Badges/Logout -> Coral Red
    "rgba(0, 210, 190,": "rgba(255, 162, 57," # Accent glow
}

# The primary text and white text
# We only want to replace '#FFFFFF' when it's text color or similar, but
# we map #FFFFFF -> #1F2937 globally except when it shouldn't.
# Wait, let's just do a smart regex for 'color: #FFFFFF'
text_white_pattern = re.compile(r"color:\s*#FFFFFF", re.IGNORECASE)

# Teal #00D2BE Mapping. 
# It maps to Sunset Orange (#FFA239) for highlights/icons.
# BUT inside specific button classes, we want Coral Red (#FF5656).

button_classes = [
    r"\.heroButton([^\{]*)\{([^\}]*)\}",
    r"\.addToCartBtn([^\{]*)\{([^\}]*)\}",
    r"\.offerButton([^\{]*)\{([^\}]*)\}",
    r"\.checkoutButton([^\{]*)\{([^\}]*)\}",
    r"\.finalCheckoutButton([^\{]*)\{([^\}]*)\}",
    r"\.viewBtn([^\{]*)\{([^\}]*)\}",
    r"\.submitButton([^\{]*)\{([^\}]*)\}"
]

def process_file(file):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Base colors
    for old, new in color_map.items():
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    
    # 2. White text to dark charcoal
    content = text_white_pattern.sub("color: #1F2937", content)

    # 3. Default Teal mapping
    content = re.sub("#00D2BE", "#FFA239", content, flags=re.IGNORECASE)
    content = re.sub("#00B3A4", "#E68924", content, flags=re.IGNORECASE)

    # 4. Fix specific button classes
    for btn_pattern in button_classes:
        matches = re.finditer(btn_pattern, content)
        for match in matches:
            full_block = match.group(0)
            inner_content = match.group(2)
            
            # For these primary buttons, background is Coral Red (#FF5656) 
            # and text is Pure White (#FFFFFF)
            
            # Revert Orange back to Coral Red
            inner_content = re.sub("#FFA239", "#FF5656", inner_content, flags=re.IGNORECASE)
            # Revert Dark Orange to Deep Red (hover states)
            inner_content = re.sub("#E68924", "#E04444", inner_content, flags=re.IGNORECASE)
            
            # Ensure text is pure white
            inner_content = re.sub(r"color:\s*#[0-9a-fA-F]{6}", "color: #FFFFFF", inner_content)
            inner_content = re.sub(r"color:\s*#1F2937", "color: #FFFFFF", inner_content, flags=re.IGNORECASE)

            new_block = match.group(0).replace(match.group(2), inner_content)
            content = content.replace(full_block, new_block)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

for file in css_files:
    process_file(file)

print(f"Processed {len(css_files)} CSS files.")
