import os
import sys
import json
import urllib.request
import urllib.error
import dulwich.porcelain as porcelain
from dulwich.repo import Repo

def verify_token_and_create_repo(token, repo_name="aura-wealth-fintech"):
    token = token.strip().replace('"', '').replace("'", "")
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "AuraWealth-Uploader"
    }
    
    # 1. Verify Token & Get Authenticated User
    user_url = "https://api.github.com/user"
    req = urllib.request.Request(user_url, headers=headers)
    username = None
    try:
        with urllib.request.urlopen(req) as resp:
            user_data = json.loads(resp.read().decode('utf-8'))
            username = user_data.get("login")
            print(f"[AUTH] Authenticated as GitHub user: @{username}")
    except urllib.error.HTTPError as e:
        print(f"[AUTH ERROR] GitHub Token is invalid or expired (HTTP {e.code}).")
        return None, None
    except Exception as e:
        print(f"[ERROR] Connection error: {e}")
        return None, None

    # 2. Check if repo exists, if not, automatically create it
    repo_check_url = f"https://api.github.com/repos/{username}/{repo_name}"
    req_check = urllib.request.Request(repo_check_url, headers=headers)
    repo_exists = False
    try:
        with urllib.request.urlopen(req_check) as resp:
            repo_exists = True
            print(f"[REPO] Target repository exists: https://github.com/{username}/{repo_name}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            repo_exists = False
        else:
            print(f"[INFO] Status code: {e.code}")

    if not repo_exists:
        print(f"[CREATE] Creating new repository '{repo_name}' on GitHub for @{username}...")
        create_url = "https://api.github.com/user/repos"
        payload = json.dumps({
            "name": repo_name,
            "description": "2026 Fintech Investment Mobile Application (AURA WEALTH) with 36 screens, double-entry ledger & biometric security",
            "private": False,
            "auto_init": False
        }).encode('utf-8')
        req_create = urllib.request.Request(create_url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req_create) as resp:
                created_data = json.loads(resp.read().decode('utf-8'))
                print(f"[SUCCESS] Created new repository: {created_data.get('html_url')}")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            print(f"[INFO] Repo creation response (HTTP {e.code}): {err_msg}")
            
    return username, repo_name

def stage_and_commit():
    repo_path = os.path.dirname(os.path.abspath(__file__))
    repo = Repo(repo_path)
    
    print("[STAGE] Staging all project files...")
    porcelain.add(repo_path)
    
    head_sha = repo.head()
    repo.refs[b'refs/heads/main'] = head_sha
    
    commit_msg = b"Feat: Complete 2026 Fintech Investment Mobile Application (AURA WEALTH) - 36 Screens, Double-Entry Ledger, Interactive Charts, Biometrics & PWA"
    author = b"Antigravity Fintech Developer <developer@fintech.local>"
    
    print("[COMMIT] Creating Git commit...")
    try:
        commit_id = porcelain.commit(repo_path, message=commit_msg, author=author, committer=author)
        sha_str = commit_id.decode('utf-8') if isinstance(commit_id, bytes) else commit_id
        print(f"[SUCCESS] Committed changes! Commit SHA: {sha_str}")
        repo.refs[b'refs/heads/main'] = repo.head()
    except Exception as e:
        print(f"[INFO] Commit status: {e}")

def push_to_github(username, token, repo_name):
    repo_path = os.path.dirname(os.path.abspath(__file__))
    repo = Repo(repo_path)
    
    token = token.strip().replace('"', '').replace("'", "")
    
    # Authenticated push URL with username + token
    authenticated_url = f"https://{username}:{token}@github.com/{username}/{repo_name}.git"
    public_url = f"https://github.com/{username}/{repo_name}"
    
    print(f"[PUSH] Pushing all code to: {public_url} ...")
    
    success = False
    for branch_ref in [b'refs/heads/main:refs/heads/main', b'refs/heads/master:refs/heads/master', b'refs/heads/master:refs/heads/main']:
        try:
            print(f"       Uploading branch: {branch_ref.decode('utf-8')} ...")
            porcelain.push(repo_path, remote_location=authenticated_url, refspecs=[branch_ref])
            success = True
            break
        except Exception as e:
            err_str = str(e)
            print(f"       Branch attempt notice: {err_str}")

    if success:
        print("\n" + "=" * 60)
        print("SUCCESS! All code has been published to GitHub!")
        print(f"View your repository: {public_url}")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Push could not complete automatically.")
        print(f"Please verify your token at: https://github.com/settings/tokens")
        print("=" * 60)

if __name__ == '__main__':
    print("=" * 60)
    print(" AURA WEALTH - GITHUB PUBLISHING UTILITY ")
    print("=" * 60)
    
    stage_and_commit()
    
    token = None
    repo_name = "aura-wealth-fintech"
    
    if len(sys.argv) > 1:
        token = sys.argv[1]
        if len(sys.argv) > 2:
            arg2 = sys.argv[2]
            if "/" in arg2:
                repo_name = arg2.rstrip("/").split("/")[-1].replace(".git", "")
            else:
                repo_name = arg2
    else:
        print("\nGitHub Authentication")
        token = input("Enter your GitHub Personal Access Token: ").strip()
        custom_repo = input(f"Enter Repository Name (Press Enter for default: '{repo_name}'): ").strip()
        if custom_repo:
            if "/" in custom_repo:
                repo_name = custom_repo.rstrip("/").split("/")[-1].replace(".git", "")
            else:
                repo_name = custom_repo

    if token:
        username, repo_name = verify_token_and_create_repo(token, repo_name)
        if username and repo_name:
            push_to_github(username, token, repo_name)
    else:
        print("[ERROR] No token provided. Push aborted.")
