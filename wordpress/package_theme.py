import os
import zipfile

def make_theme_zip():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    theme_dir = os.path.join(base_dir, 'wordpress', 'antigravity-fintech-theme')
    output_zip = os.path.join(base_dir, 'wordpress', 'antigravity-fintech-theme.zip')
    
    print(f"Packaging {theme_dir} into {output_zip}...")
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(theme_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, os.path.dirname(theme_dir))
                zipf.write(file_path, rel_path)
                
    file_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[OK] Successfully created installable WordPress theme zip: {output_zip} ({file_size_mb:.2f} MB)")

if __name__ == '__main__':
    make_theme_zip()
