import os
import shutil

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_frontend = os.path.join(base_dir, 'frontend')
dest_www = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'assets', 'www')

print(f"Copying {src_frontend} to {dest_www}...")
if os.path.exists(dest_www):
    shutil.rmtree(dest_www)

shutil.copytree(src_frontend, dest_www)

# Also copy Firebase assets if present
src_firebase = os.path.join(base_dir, 'firebase')
if os.path.exists(src_firebase):
    dest_fb = os.path.join(dest_www, 'firebase')
    shutil.copytree(src_firebase, dest_fb)

print(f"[OK] Android assets successfully prepared in {dest_www}")
