import os
import sys

def push_with_dulwich(repo_path, remote_url):
    import dulwich.porcelain as porcelain
    from dulwich.repo import Repo
    
    print(f"Initializing repository at {repo_path}...")
    if not os.path.exists(os.path.join(repo_path, '.git')):
        repo = porcelain.init(repo_path)
    else:
        repo = Repo(repo_path)

    print("Adding all files...")
    porcelain.add(repo_path, paths=['.'])

    print("Committing changes...")
    try:
        porcelain.commit(repo_path, message="Initial commit: Complete modern fintech investment platform with admin web panel and Supabase auth", author="shivudm555-byte <shivasagarn99@gmail.com>")
    except Exception as e:
        print(f"Commit note: {e}")

    print(f"Setting remote to {remote_url}...")
    config = repo.get_config()
    config.set(('remote', 'origin'), 'url', remote_url)
    config.write_to_path()

    print("Pushing to remote...")
    try:
        porcelain.push(repo_path, remote_location=remote_url, refspecs=['refs/heads/main:refs/heads/main'])
        print("Push completed successfully via Dulwich!")
    except Exception as e:
        print(f"Dulwich push note: {e}")

if __name__ == '__main__':
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('GITHUB_TOKEN', '')
    
    if token:
        remote = f"https://shivudm555-byte:{token}@github.com/shivudm555-byte/invest.git"
    else:
        remote = "https://github.com/shivudm555-byte/invest.git"
        
    print(f"Target Remote: https://github.com/shivudm555-byte/invest.git")
    push_with_dulwich(repo_dir, remote)
