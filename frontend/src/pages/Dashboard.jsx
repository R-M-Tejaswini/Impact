import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Clock, Briefcase, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { workAPI, blockerAPI, skillAPI, projectAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentWork, setRecentWork] = useState([]);
  const [activeBlockers, setActiveBlockers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadProjects();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, workRes, blockersRes] = await Promise.all([
        workAPI.getStats(),
        workAPI.getWeekly(),
        blockerAPI.getActive(),
      ]);
      setStats(statsRes.data);
      // ✅ Show all work, not just first 5
      setRecentWork(Array.isArray(workRes.data) ? workRes.data : []);
      // ✅ Show all blockers, not just first 3
      setActiveBlockers(Array.isArray(blockersRes.data) ? blockersRes.data : []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getActive();
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading your data...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's your week so far.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-primary" />
            <Badge variant="outline" className="text-success">+12%</Badge>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.total_hours || 0}h</p>
          <p className="text-sm text-muted-foreground">Hours This Week</p>
        </div>

        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="h-8 w-8 text-accent" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.entry_count || 0}</p>
          <p className="text-sm text-muted-foreground">Work Entries</p>
        </div>

        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-danger" />
          </div>
          <p className="text-3xl font-bold text-foreground">{activeBlockers.length}</p>
          <p className="text-sm text-muted-foreground">Active Blockers</p>
        </div>

        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">{projects.length}</p>
          <p className="text-sm text-muted-foreground">Projects</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity ({recentWork.length})</h3>
            <Link to="/work">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentWork.length > 0 ? (
              recentWork.slice(0, 8).map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{entry.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{entry.entry_type}</Badge>
                        <span className="text-xs text-muted-foreground">{entry.hours_spent}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent work. Start logging!</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/work" className="block">
              <Button variant="hero" className="w-full justify-start gap-3">
                <Plus className="h-5 w-5" />
                Log Work
              </Button>
            </Link>
            <Link to="/blockers" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <AlertCircle className="h-5 w-5" />
                Add Blocker
              </Button>
            </Link>
            <Link to="/summary" className="block">
              <Button variant="accent" className="w-full justify-start gap-3">
                <TrendingUp className="h-5 w-5" />
                Weekly Summary
              </Button>
            </Link>
            <Link to="/analytics" className="block">
              <Button variant="secondary" className="w-full justify-start gap-3">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Blockers */}
      {activeBlockers.length > 0 && (
        <div className="mt-6 bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Active Blockers ({activeBlockers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBlockers.map((blocker) => (
              <div key={blocker.id} className="p-4 rounded-lg border border-danger/30 bg-danger/5">
                <h4 className="font-medium text-foreground mb-1">{blocker.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{blocker.blocking_reason}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-danger">⏱️ {blocker.hours_lost}h lost</span>
                  <span className="text-xs text-muted-foreground">Waiting on: {blocker.waiting_on}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}