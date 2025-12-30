import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, FolderOpen, Clock, CheckCircle, X, Calendar } from 'lucide-react';
import { projectAPI } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: 'internship',
    status: 'planning',
    tech_stack: '',
    start_date: new Date().toISOString().split('T')[0],
    target_end_date: '',
    repository_url: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // ✅ Get ALL projects
      const response = await projectAPI.getAll();
      const allProjects = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setProjects(allProjects.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map(t => t.trim()) : [],
      };
      await projectAPI.create(data);
      setFormData({
        title: '',
        description: '',
        project_type: 'internship',
        status: 'planning',
        tech_stack: '',
        start_date: new Date().toISOString().split('T')[0],
        target_end_date: '',
        repository_url: '',
      });
      setShowForm(false);
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await projectAPI.complete(id);
      loadProjects();
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-warning/10 text-warning',
      in_progress: 'bg-primary/10 text-primary',
      completed: 'bg-success/10 text-success',
      on_hold: 'bg-muted text-muted-foreground',
    };
    return colors[status] || colors.planning;
  };

  const getTypeColor = (type) => {
    const colors = {
      internship: 'bg-accent/10 text-accent',
      side: 'bg-primary/10 text-primary',
      learning: 'bg-success/10 text-success',
    };
    return colors[type] || colors.internship;
  };

  if (loading) {
    return (
      <AppLayout title="Projects" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Projects" subtitle="Track internship and side projects">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-2xl font-bold text-primary">{projects.length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 card-shadow">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-accent">
            {projects.filter(p => p.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success">
            {projects.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Total Hours</p>
          <p className="text-2xl font-bold text-foreground">
            {projects.reduce((sum, p) => sum + (p.total_hours || 0), 0).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">All Projects</h2>
        <Button variant="default" className="gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Create New Project</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Project Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., E-commerce Admin Dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="What is this project about?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option value="internship">Internship Project</option>
                  <option value="side">Side Project</option>
                  <option value="learning">Learning Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tech Stack (comma-separated)</label>
              <Input
                value={formData.tech_stack}
                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                placeholder="React, Django, PostgreSQL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target End Date</label>
                <Input
                  type="date"
                  value={formData.target_end_date}
                  onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Repository URL</label>
              <Input
                type="url"
                value={formData.repository_url}
                onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Create Project
            </Button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-xl p-6 card-shadow card-hover animate-slide-up"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <FolderOpen className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Badge className={getTypeColor(project.project_type)}>
                      {project.project_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                {project.status !== 'completed' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleComplete(project.id)}
                    title="Mark as completed"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                  </Button>
                )}
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech_stack.map((tech, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.start_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {project.total_hours.toFixed(1)}h
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 bg-card rounded-xl card-shadow">
            <FolderOpen className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium mb-2">No projects yet!</p>
            <Button onClick={() => setShowForm(true)} variant="default">
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}