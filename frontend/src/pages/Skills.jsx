import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, Trash2, X, Sparkles, TrendingUp } from 'lucide-react'; // Add Sparkles here
import { skillAPI, aiAPI } from '../services/api';
import { cn } from '../lib/utils';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'technical',
    proficiency: 'beginner',
  });

  // Fetch all skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await skillAPI.getAll();
        const data = Array.isArray(response.data) ? response.data : [];
        setSkills(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(err.message);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await skillAPI.create({
        skill_name: formData.name,
        category: formData.category,
        proficiency: formData.proficiency,
      });
      // Map the response field to match what's displayed
      const newSkill = {
        ...response.data,
        name: response.data.skill_name || response.data.name,
      };
      setSkills([...skills, newSkill]);
      setFormData({
        name: '',
        category: 'technical',
        proficiency: 'beginner',
      });
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
      // Assuming the API returns newly extracted skills
      if (response.data.skills) {
        setSkills([...skills, ...response.data.skills]);
      }
      setError(null);
    } catch (err) {
      console.error('Error extracting skills:', err);
      setError('Failed to extract skills from work entries');
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

  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

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
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold text-primary">{Object.keys(skillsByCategory).length}</p>
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
            {extracting ? 'Extracting...' : 'AI Extract Skills'}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., React, Python, Docker"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-input bg-background rounded-md px-3 py-2"
                >
                  <option value="technical">Technical</option>
                  <option value="soft-skills">Soft Skills</option>
                  <option value="tools">Tools</option>
                  <option value="frameworks">Frameworks</option>
                  <option value="languages">Languages</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Proficiency
                </label>
                <select
                  value={formData.proficiency}
                  onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                  className="w-full border border-input bg-background rounded-md px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Add Skill
            </Button>
          </form>
        </div>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-foreground mb-3 capitalize flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-card rounded-lg p-4 card-shadow card-hover flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{skill.name}</h4>
                    <Badge 
                      variant="outline"
                      className={cn(
                        'text-xs',
                        skill.proficiency === 'beginner' && 'bg-blue-50 text-blue-700 border-blue-200',
                        skill.proficiency === 'intermediate' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        skill.proficiency === 'advanced' && 'bg-orange-50 text-orange-700 border-orange-200',
                        skill.proficiency === 'expert' && 'bg-green-50 text-green-700 border-green-200'
                      )}
                    >
                      {skill.proficiency}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(skill.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {skills.length === 0 && (
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