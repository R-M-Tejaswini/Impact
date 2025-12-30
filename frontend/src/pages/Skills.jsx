import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Trash2, X, Sparkles, TrendingUp } from 'lucide-react';
import { skillAPI, aiAPI } from '../services/api';
import { cn } from '../lib/utils';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    skill_name: '',  // Changed from 'name' to 'skill_name'
  });

  // Fetch all skills on page load
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      // ✅ Get ALL skills ordered by confidence
      const response = await skillAPI.getAll();
      const skillsData = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      // Sort by confidence level descending
      setSkills(skillsData.sort((a, b) => b.confidence_level - a.confidence_level));
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await skillAPI.create({
        skill_name: formData.skill_name,
      });
      setSkills([...skills, response.data]);
      setFormData({ skill_name: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating skill:', err);
      setError(err.response?.data?.detail || 'Failed to create skill');
    }
  };

  const handleExtractSkills = async () => {
    try {
      setExtracting(true);
      const response = await aiAPI.extractSkills();
      // Refresh skills after extraction
      fetchSkills();
      setError(null);
    } catch (err) {
      console.error('Error extracting skills:', err);
      setError(err.response?.data?.detail || 'Failed to extract skills from work entries');
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await skillAPI.delete(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError('Failed to delete skill');
    }
  };

  if (loading) return <AppLayout><div className="p-4">Loading skills...</div></AppLayout>;

  return (
    <AppLayout title="Skills" subtitle="Track your technical and professional skills">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Total Skills</p>
          <p className="text-2xl font-bold text-primary">{skills.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Avg Confidence</p>
          <p className="text-2xl font-bold text-primary">
            {skills.length > 0 
              ? (skills.reduce((sum, s) => sum + (s.confidence_level || 0), 0) / skills.length).toFixed(1)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-foreground">Your Skills</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExtractSkills}
            disabled={extracting}
          >
            <Sparkles className="w-4 h-4" />
            {extracting ? 'Extracting...' : 'AI Extract'}
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Skill'}
          </Button>
        </div>
      </div>

      {/* Add Skill Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Skill</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Skill Name *
              </label>
              <Input
                value={formData.skill_name}
                onChange={(e) => setFormData({ skill_name: e.target.value })}
                required
                placeholder="e.g., React, Python, Docker"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Add Skill
            </Button>
          </form>
        </div>
      )}

      {/* Skills List */}
      <div>
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-card rounded-lg p-4 card-shadow card-hover animate-slide-up flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">{skill.skill_name}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Level: {skill.confidence_level}/5</p>
                    <p>Mentioned: {skill.times_mentioned}x</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(skill.id)}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl card-shadow">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium mb-2">No skills yet!</p>
            <p className="text-muted-foreground text-sm mb-4">Add skills manually or use AI to extract them from your work entries</p>
            <Button onClick={handleExtractSkills} variant="default" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Extract Skills with AI
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}