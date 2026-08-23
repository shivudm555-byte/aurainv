import os
import sys
import dulwich.porcelain as porcelain
from dulwich.repo import Repo

def stage_and_commit():
    repo_path = os.path.dirname(os.path.abspath(__file__))
    print(f"📁 Repository Path: {repo_path}")
    
    repo = Repo(repo_path)
    
    print("⏳ Staging all project files...")
    porcelain.add(repo_path)
    
    # Ensure refs/heads/main branch exists
    head_sha = repo.head()
    repo.refs[b'refs/heads/main'] = head_sha
    
    commit_msg = b"Feat: Complete 2026 Fintech Investment Mobile Application (AURA WEALTH) - 36 Screens, Double-Entry Ledger, Interactive Charts, Biometrics & PWA"
    author = b"Antigravity Fintech Developer <developer@fintech.local>"
    
    print("📝 Creating Git commit...")
    try:
        commit_id = porcelain.commit(repo_path, message=commit_msg, author=author, committer=author)
        sha_str = commit_id.decode('utf-8') if isinstance(commit_id, bytes) else commit_id
        print(f"✅ Committed changes! Commit SHA: {sha_str}")
        repo.refs[b'refs/heads/main'] = repo.head()
    except Exception as e:
        print(f"ℹ️ Commit status: {e}")

def push_to_github(token, repo_url=None):
    repo_path = os.path.dirname(os.path.abspath(__file__))
    repo = Repo(repo_path)
    
    token = token.strip().replace('"', '').replace("'", "")
    
    if not repo_url:
        repo_url = "https://github.com/shivudm555-byte/invest.git"
    else:
        repo_url = repo_url.strip().replace('"', '').replace("'", "")
    
    # Strip existing https:// and auth
    clean_url = repo_url.replace("https://", "").replace("http://", "")
    if "@" in clean_url:
        clean_url = clean_url.split("@")[-1]
        
    authenticated_url = f"https://oauth2:{token}@{clean_url}"
    
    print(f"\n🚀 Pushing all code to: https://{clean_url} ...")
    
    # Try pushing to main and master
    success = False
    for branch_ref in [b'refs/heads/main:refs/heads/main', b'refs/heads/master:refs/heads/master']:
        try:
            print(f"   Uploading ref: {branch_ref.decode('utf-8')} ...")
            porcelain.push(repo_path, remote_location=authenticated_url, refspecs=[branch_ref])
            success = True
        except Exception as e:
            # Try next branch ref if one is rejected
            pass

    if success:
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! All code has been published to GitHub!")
        print(f"🔗 View your repository: https://{clean_url.replace('.git', '')}")
        print("=" * 60)
    else:
        # If both individual pushes failed, try default push
        try:
            porcelain.push(repo_path, remote_location=authenticated_url, refspecs=[b'refs/heads/main:refs/heads/main'])
            print("\n🎉 SUCCESS! All code has been published to GitHub!")
        except Exception as err:
            print(f"\n❌ [ERROR] Push failed: {err}")
            print("\nTroubleshooting tips:")
            print("1. Verify your Personal Access Token has the 'repo' scope checked.")
            print("2. Ensure the repository exists at your GitHub account.")

if __name__ == '__main__':
    stage_and_commit()
    
    token = None
    target_repo = None
    
    if len(sys.argv) > 1:
        token = sys.argv[1]
        if len(sys.argv) > 2:
            target_repo = sys.argv[2]
    else:
        print("\n" + "-" * 50)
        print("🔑 GitHub Authentication Required")
        print("-" * 50)
        token = input("Enter your GitHub Personal Access Token (ghp_...): ").strip()
        repo_input = input("Enter your GitHub Repo URL (Press Enter for default: https://github.com/shivudm555-byte/invest.git): ").strip()
        if repo_input:
            target_repo = repo_input

    if token:
        push_to_github(token, target_repo)
    else:
        print("❌ No token provided. Push aborted.")
