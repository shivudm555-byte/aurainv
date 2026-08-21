import os
import zipfile

def make_plugin_zip():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    plugin_dir = os.path.join(base_dir, 'wordpress', 'antigravity-fintech')
    output_zip = os.path.join(base_dir, 'wordpress', 'antigravity-fintech.zip')
    
    print(f"Packaging {plugin_dir} into {output_zip}...")
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(plugin_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Ensure the zip has 'antigravity-fintech/' as root folder inside the zip
                rel_path = os.path.relpath(file_path, os.path.dirname(plugin_dir))
                zipf.write(file_path, rel_path)
                
    file_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"[OK] Successfully created installable WordPress plugin zip: {output_zip} ({file_size_mb:.2f} MB)")

if __name__ == '__main__':
    make_plugin_zip()
