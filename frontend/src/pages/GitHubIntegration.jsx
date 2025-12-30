import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Github, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function GitHubIntegration() {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/github/status/');
      const data = await response.json();
      setConnected(data.connected);
      setUsername(data.username);
    } catch (err) {
      console.error('Error checking GitHub status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!token) {
      setError('Please enter your GitHub token');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/github/connect/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setConnected(true);
        setUsername(data.username);
        setToken('');
        setError(null);
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch('http://localhost:8000/api/github/sync/', {
        method: 'POST',
      });
      
      const data = await response.json();
      if (response.ok) {
        setError(null);
        alert(`Synced ${data.synced} commits!`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppLayout title="GitHub Integration" subtitle="Connect your GitHub account">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {connected ? (
          <div className="bg-card rounded-xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <h3 className="text-xl font-bold text-foreground">Connected</h3>
            </div>
            <p className="text-foreground mb-2">GitHub username: <Badge>{username}</Badge></p>
            <p className="text-sm text-muted-foreground mb-6">
              Your GitHub commits will be automatically logged as work entries.
            </p>
            <Button onClick={handleSync} disabled={syncing} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {syncing ? 'Syncing...' : 'Sync Commits Now'}
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Github className="w-6 h-6" />
              <h3 className="text-xl font-bold text-foreground">Connect GitHub</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a personal access token on <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Settings</a> with repo access.
            </p>
            <Input
              type="password"
              placeholder="Paste your GitHub token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleConnect} disabled={loading} variant="hero">
              Connect GitHub
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}