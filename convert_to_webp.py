import os
import json
from PIL import Image
from pathlib import Path

# Configuration
IMAGE_DIR = 'images'
JSON_FILE = 'products.json'
QUALITY = 80

def convert_images():
    print(f"Starting conversion in {IMAGE_DIR}...")
    
    # Track renaming for JSON update
    renames = {}
    
    # Ensure directory exists
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: {IMAGE_DIR} not found.")
        return

    files = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    print(f"Found {len(files)} images to convert.")

    for filename in files:
        filepath = os.path.join(IMAGE_DIR, filename)
        
        # Construct new filename (replace extension with .webp)
        # Handle complex extensions like .png.opt...png by just replacing the last extension
        stem = Path(filename).stem
        # Double check if stem still has an extension if it was double-barrelled
        # But simple change matches products.json logic better
        
        # Strategy: preserve the entire name except the very last extension
        # e.g. "image.png.opt.png" -> "image.png.opt.webp"
        # This preserves the dimension info in the filename
        new_filename = os.path.splitext(filename)[0] + '.webp'
        new_filepath = os.path.join(IMAGE_DIR, new_filename)

        print(f"Converting {filename} -> {new_filename}...")
        
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if necessary (PNGs might have transparency)
                # WebP supports transparency, but if it fails we might need RGBA
                img.save(new_filepath, 'webp', quality=QUALITY)
                
            renames[f"{IMAGE_DIR}/{filename}"] = f"{IMAGE_DIR}/{new_filename}"
            
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

    return renames

def update_json(renames):
    print("Updating products.json...")
    
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace all occurrences
        for old_path, new_path in renames.items():
            content = content.replace(old_path, new_path)
            
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("products.json updated successfully.")
        
    except Exception as e:
        print(f"Error updating JSON: {e}")

if __name__ == '__main__':
    renames = convert_images()
    if renames:
        update_json(renames)
        print("Conversion complete!")
    else:
        print("No images converted.")
