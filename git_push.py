import os
import sys
import dulwich.porcelain as porcelain
from dulwich.repo import Repo

def stage_and_commit():
    repo_path = os.path.dirname(os.path.abspath(__file__))
    print(f"Working in repository: {repo_path}")
    
    repo = Repo(repo_path)
    
    print("Staging all files...")
    porcelain.add(repo_path)
    
    commit_msg = b"Feat: Complete 2026 Fintech Investment Mobile Application (AURA WEALTH) - 36 Screens, Double-Entry Ledger, Interactive Charts, Biometrics & PWA"
    author = b"Antigravity Fintech Developer <developer@fintech.local>"
    
    print("Creating git commit...")
    try:
        commit_id = porcelain.commit(repo_path, message=commit_msg, author=author, committer=author)
        print(f"[SUCCESS] Committed changes! Commit SHA: {commit_id.decode('utf-8') if isinstance(commit_id, bytes) else commit_id}")
    except Exception as e:
        print(f"Commit note: {e}")

def push_to_github(token, repo_url=None):
    repo_path = os.path.dirname(os.path.abspath(__file__))
    repo = Repo(repo_path)
    
    if not repo_url:
        # Default or user supplied repo URL
        repo_url = "https://github.com/shivudm555-byte/invest.git"
    
    # Strip existing https://
    clean_url = repo_url.replace("https://", "").replace("http://", "")
    authenticated_url = f"https://oauth2:{token}@{clean_url}"
    
    print(f"Pushing commit to: {repo_url} ...")
    try:
        porcelain.push(repo_path, remote_location=authenticated_url, refspecs=[b'refs/heads/main:refs/heads/main'])
        print("[SUCCESS] Successfully pushed all branches and files to GitHub!")
    except Exception as e:
        print(f"[ERROR] Push failed: {e}")
        print("\nPlease ensure your GitHub Personal Access Token (classic or fine-grained) has 'repo' (read & write) permissions.")

if __name__ == '__main__':
    stage_and_commit()
    if len(sys.argv) > 1:
        token = sys.argv[1]
        target_repo = sys.argv[2] if len(sys.argv) > 2 else None
        push_to_github(token, target_repo)
    else:
        print("\nTo push directly to GitHub, run:")
        print("python git_push.py <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN> [OPTIONAL_REPO_URL]")
