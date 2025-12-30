import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, Clock, Trash2, Save, X } from 'lucide-react';
import { workAPI } from '../services/api';
import { cn } from '../lib/utils';

export default function WorkItems() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hours_spent: '',
    entry_type: 'coding',
    tags: '',
    learning_notes: '',
  });

  const entryTypes = [
    { value: 'coding', label: 'Coding', color: 'bg-primary/10 text-primary' },
    { value: 'meeting', label: 'Meeting', color: 'bg-accent/10 text-accent' },
    { value: 'learning', label: 'Learning', color: 'bg-success/10 text-success' },
    { value: 'review', label: 'Code Review', color: 'bg-warning/10 text-warning' },
    { value: 'bug_fix', label: 'Bug Fix', color: 'bg-danger/10 text-danger' },
    { value: 'documentation', label: 'Documentation', color: 'bg-secondary text-secondary-foreground' },
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      // ✅ Get ALL entries, not just weekly
      const response = await workAPI.getAll();
      const allEntries = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setEntries(allEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error loading work entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        hours_spent: parseFloat(formData.hours_spent),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      };
      await workAPI.create(data);
      setFormData({
        title: '',
        description: '',
        hours_spent: '',
        entry_type: 'coding',
        tags: '',
        learning_notes: '',
      });
      setShowForm(false);
      loadEntries();
    } catch (error) {
      console.error('Error creating work entry:', error);
      alert('Failed to create work entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this work entry?')) return;
    try {
      await workAPI.delete(id);
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getTypeConfig = (type) => {
    return entryTypes.find(t => t.value === type) || entryTypes[0];
  };

  if (loading) {
    return (
      <AppLayout title="Work Items" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Work Items" subtitle="Track your projects and daily work">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-card rounded-lg p-3 card-shadow">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold text-foreground">
              {entries.reduce((sum, e) => sum + e.hours_spent, 0).toFixed(1)}h
            </p>
          </div>
          <div className="bg-card rounded-lg p-3 card-shadow">
            <p className="text-sm text-muted-foreground">Entries</p>
            <p className="text-2xl font-bold text-foreground">{entries.length}</p>
          </div>
        </div>

        <Button
          variant="default"
          className="gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Work'}
        </Button>
      </div>

      {/* Add Work Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Log New Work</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Fixed login bug, Built dashboard component"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="What did you work on? Any challenges?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hours Spent *
                </label>
                <Input
                  type="number"
                  value={formData.hours_spent}
                  onChange={(e) => setFormData({ ...formData, hours_spent: e.target.value })}
                  required
                  step="0.5"
                  min="0"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <select
                  value={formData.entry_type}
                  onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {entryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="react, api, frontend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Learning Notes
              </label>
              <Textarea
                value={formData.learning_notes}
                onChange={(e) => setFormData({ ...formData, learning_notes: e.target.value })}
                rows={3}
                placeholder="What did you learn? Any new skills or insights?"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full gap-2">
              <Save className="w-4 h-4" />
              Save Work Entry
            </Button>
          </form>
        </div>
      )}

      {/* Work Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.length > 0 ? (
          entries.map((entry) => {
            const typeConfig = getTypeConfig(entry.entry_type);
            return (
              <div
                key={entry.id}
                className="bg-card rounded-xl p-5 card-shadow card-hover animate-slide-up group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-foreground">{entry.title}</h3>
                      <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {entry.hours_spent}h
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {entry.learning_notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">💡 Learning</p>
                    <p className="text-sm text-foreground">{entry.learning_notes}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground mb-4">No work entries yet</p>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Log Your First Entry
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}