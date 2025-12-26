import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Clock, Briefcase, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { workAPI, blockerAPI, skillAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentWork, setRecentWork] = useState([]);
  const [activeBlockers, setActiveBlockers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, workRes, blockersRes] = await Promise.all([
        workAPI.getStats(),
        workAPI.getWeekly(),
        blockerAPI.getActive(),
      ]);
      setStats(statsRes.data);
      setRecentWork(workRes.data.slice(0, 5));
      setActiveBlockers(blockersRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
            <Badge variant="outline" className="text-success">
              +12%
            </Badge>
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
          <p className="text-3xl font-bold text-foreground">87</p>
          <p className="text-sm text-muted-foreground">Initiative Score</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <Link to="/work">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentWork.length > 0 ? (
              recentWork.map((entry) => (
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
                Generate Summary
              </Button>
            </Link>
          </div>

          {activeBlockers.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-foreground mt-6 mb-3">Active Blockers</h4>
              <div className="space-y-2">
                {activeBlockers.map((blocker) => (
                  <div key={blocker.id} className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <p className="text-sm font-medium text-foreground">{blocker.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Waiting on: {blocker.waiting_on}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}