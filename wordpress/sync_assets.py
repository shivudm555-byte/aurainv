import os
import shutil

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_frontend = os.path.join(base_dir, 'frontend')
dest_assets = os.path.join(base_dir, 'wordpress', 'antigravity-fintech', 'assets')

# 1. Copy CSS
dest_css = os.path.join(dest_assets, 'css')
os.makedirs(dest_css, exist_ok=True)
for f in os.listdir(os.path.join(src_frontend, 'css')):
    shutil.copy2(os.path.join(src_frontend, 'css', f), os.path.join(dest_css, f))

# 2. Copy JS
dest_js = os.path.join(dest_assets, 'js')
os.makedirs(dest_js, exist_ok=True)

# Copy base JS
for f in os.listdir(os.path.join(src_frontend, 'js')):
    src_f = os.path.join(src_frontend, 'js', f)
    if os.path.isfile(src_f):
        shutil.copy2(src_f, os.path.join(dest_js, f))

# Copy mobile JS
dest_mobile = os.path.join(dest_js, 'mobile')
os.makedirs(dest_mobile, exist_ok=True)
for f in os.listdir(os.path.join(src_frontend, 'js', 'mobile')):
    shutil.copy2(os.path.join(src_frontend, 'js', 'mobile', f), os.path.join(dest_mobile, f))

# Copy admin JS
dest_admin = os.path.join(dest_js, 'admin')
os.makedirs(dest_admin, exist_ok=True)
for f in os.listdir(os.path.join(src_frontend, 'js', 'admin')):
    shutil.copy2(os.path.join(src_frontend, 'js', 'admin', f), os.path.join(dest_admin, f))

# 3. Update api.js in WordPress assets to check window.agy_wp_vars
wp_api_file = os.path.join(dest_js, 'api.js')
with open(wp_api_file, 'r', encoding='utf-8') as f:
    content = f.read()

wp_header = """// Check if running inside WordPress
if (typeof window !== 'undefined' && window.agy_wp_vars && window.agy_wp_vars.rest_url) {
  API.BASE_URL = window.agy_wp_vars.rest_url;
}
"""
content = wp_header + content
with open(wp_api_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Assets synchronized to {dest_assets} successfully!")
