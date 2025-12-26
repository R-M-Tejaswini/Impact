import requests
from datetime import datetime, timedelta
from django.utils import timezone


class GitHubService:
    def __init__(self, access_token):
        self.access_token = access_token
        self.headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        self.base_url = 'https://api.github.com'
    
    def get_user(self):
        """Get authenticated user info"""
        response = requests.get(f'{self.base_url}/user', headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_recent_commits(self, days=7):
        """Get commits from the past week across all repos"""
        user = self.get_user()
        username = user['login']
        
        since = (datetime.now() - timedelta(days=days)).isoformat() + 'Z'
        
        # Get user's repos
        repos_response = requests.get(
            f'{self.base_url}/user/repos?per_page=100',
            headers=self.headers
        )
        repos = repos_response.json()
        
        all_commits = []
        for repo in repos:
            try:
                commits_response = requests.get(
                    f'{self.base_url}/repos/{repo["full_name"]}/commits',
                    headers=self.headers,
                    params={'author': username, 'since': since, 'per_page': 50}
                )
                if commits_response.status_code == 200:
                    commits = commits_response.json()
                    for commit in commits:
                        all_commits.append({
                            'repo': repo['name'],
                            'message': commit['commit']['message'],
                            'date': commit['commit']['author']['date'],
                            'sha': commit['sha'][:7],
                            'url': commit['html_url']
                        })
            except Exception:
                continue
        
        return all_commits
    
    def get_pr_stats(self, days=7):
        """Get PR statistics"""
        user = self.get_user()
        username = user['login']
        since = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Search for PRs
        query = f'author:{username} type:pr created:>={since[:10]}'
        response = requests.get(
            f'{self.base_url}/search/issues',
            headers=self.headers,
            params={'q': query, 'per_page': 100}
        )
        
        prs = response.json().get('items', [])
        
        opened = len(prs)
        merged = len([pr for pr in prs if pr.get('pull_request', {}).get('merged_at')])
        
        # Get review stats
        review_query = f'reviewed-by:{username} type:pr created:>={since[:10]}'
        review_response = requests.get(
            f'{self.base_url}/search/issues',
            headers=self.headers,
            params={'q': review_query, 'per_page': 100}
        )
        reviewed = review_response.json().get('total_count', 0)
        
        return {
            'opened': opened,
            'merged': merged,
            'reviewed': reviewed
        }