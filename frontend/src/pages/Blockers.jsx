import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, Clock, User, CheckCircle2, Trash2, X, AlertTriangle } from 'lucide-react';
import { blockerAPI } from '../services/api';  // Correct import
import { cn } from '../lib/utils';

export default function Blockers() {
  const [blockers, setBlockers] = useState([]);
  const [activeBlockers, setActiveBlockers] = useState([]);
  const [resolvedBlockers, setResolvedBlockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    blocking_reason: '',
    waiting_on: '',
    hours_lost: 0,
    status: 'active',
  });

  // Fetch all blockers on page load
  useEffect(() => {
    fetchBlockers();
  }, []);

  const fetchBlockers = async () => {
    try {
      setLoading(true);
      const response = await blockerAPI.getAll();
      console.log('Blockers response:', response.data);
      
      // Extract results from paginated response
      const data = response.data.results ? response.data.results : [];
      setBlockers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blockers:', err);
      setError(err.message);
      setBlockers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter active and resolved blockers
  useEffect(() => {
    if (Array.isArray(blockers)) {
      const active = blockers.filter(b => b.status === 'active');
      const resolved = blockers.filter(b => b.status === 'resolved');
      setActiveBlockers(active);
      setResolvedBlockers(resolved);
    }
  }, [blockers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await blockerAPI.create(formData);
      setBlockers([...blockers, response.data]);
      setFormData({
        title: '',
        blocking_reason: '',
        waiting_on: '',
        hours_lost: 0,
        status: 'active',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating blocker:', err);
      setError(err.response?.data?.title?.[0] || 'Failed to create blocker');
    }
  };

  const handleResolve = async (id) => {
    try {
      await blockerAPI.resolve(id);
      const updated = blockers.map(b => 
        b.id === id ? { ...b, status: 'resolved' } : b
      );
      setBlockers(updated);
    } catch (err) {
      console.error('Error resolving blocker:', err);
      setError('Failed to resolve blocker');
    }
  };

  const handleDelete = async (id) => {
    try {
      await blockerAPI.delete(id);
      setBlockers(blockers.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting blocker:', err);
      setError('Failed to delete blocker');
    }
  };

  if (loading) return <AppLayout><div className="p-4">Loading blockers...</div></AppLayout>;

  return (
    <AppLayout title="Blockers" subtitle="Track and resolve what's holding you back">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Active Blockers</p>
          <p className="text-2xl font-bold text-danger">{activeBlockers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-success">{resolvedBlockers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Total Hours Lost</p>
          <p className="text-2xl font-bold text-foreground">
            {activeBlockers.reduce((sum, b) => sum + (b.hours_lost || 0), 0).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-card rounded-lg p-1 card-shadow">
          {['active', 'resolved'].map((status) => (
            <button
              key={status}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize",
                status === 'active'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <Button
          variant="default"
          className="gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Blocker'}
        </Button>
      </div>

      {/* Add Blocker Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Blocker</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What's blocking you? *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Waiting for API documentation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason *
              </label>
              <Textarea
                value={formData.blocking_reason}
                onChange={(e) => setFormData({ ...formData, blocking_reason: e.target.value })}
                required
                rows={2}
                placeholder="Why are you blocked?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Waiting On *
                </label>
                <Input
                  value={formData.waiting_on}
                  onChange={(e) => setFormData({ ...formData, waiting_on: e.target.value })}
                  required
                  placeholder="Person or system"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hours Lost
                </label>
                <Input
                  type="number"
                  value={formData.hours_lost}
                  onChange={(e) => setFormData({ ...formData, hours_lost: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Add Blocker
            </Button>
          </form>
        </div>
      )}

      {/* Active Blockers */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Active Blockers ({activeBlockers.length})
        </h3>
        <div className="space-y-4">
          {activeBlockers.length > 0 ? (
            activeBlockers.map((blocker) => (
              <div
                key={blocker.id}
                className="bg-card rounded-xl p-5 card-shadow card-hover animate-slide-up border-l-4 border-danger"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h4 className="text-base font-semibold text-foreground">
                        {blocker.title}
                      </h4>
                      <Badge className="gap-1 bg-danger/10 text-danger">
                        <AlertTriangle className="w-3 h-3" />
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {blocker.blocking_reason}
                    </p>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-4 h-4" />
                        {blocker.waiting_on}
                      </span>
                      {blocker.hours_lost > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="flex items-center gap-1.5 text-danger">
                            <Clock className="w-4 h-4" />
                            {blocker.hours_lost}h lost
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(blocker.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(blocker.id)}
                      className="gap-1.5 bg-success/10 hover:bg-success/20 text-success border-success/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Resolve
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(blocker.id)}
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-xl card-shadow">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-foreground font-medium mb-2">No active blockers!</p>
              <p className="text-muted-foreground text-sm">Great job staying unblocked 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolved Blockers */}
      {resolvedBlockers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Resolved ({resolvedBlockers.length})
          </h3>
          <div className="space-y-3">
            {resolvedBlockers.map((blocker) => (
              <div
                key={blocker.id}
                className="bg-card rounded-xl p-4 card-shadow opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground line-through">
                      {blocker.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolved: {new Date(blocker.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(blocker.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}