import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, TrendingUp, Target, Sparkles, Loader2, PieChart } from 'lucide-react';
import { analyticsAPI, skillAPI } from '../services/api';
import SkillRadarChart from '../components/SkillRadarChart';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, skillsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        skillAPI.getAll(),
      ]);
      setOverview(overviewRes.data);
      setSkills(Array.isArray(skillsRes.data) ? skillsRes.data : []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const runGapAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await analyticsAPI.gapAnalysis();
      setGapAnalysis(response.data);
    } catch (error) {
      console.error('Error running gap analysis:', error);
      alert('Failed to generate gap analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const COLORS = {
    frontend: 'hsl(var(--primary))',
    backend: 'hsl(var(--accent))',
    devops: 'hsl(var(--success))',
    testing: 'hsl(var(--warning))',
    other: 'hsl(var(--muted))',
  };

  if (loading) {
    return (
      <AppLayout title="Analytics" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Analytics & Insights" subtitle="Track your growth and identify skill gaps">
      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 card-shadow">
            <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-primary">{overview.active_projects}</p>
          </div>
          <div className="bg-card rounded-lg p-4 card-shadow">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-success">{overview.completed_projects}</p>
          </div>
          <div className="bg-card rounded-lg p-4 card-shadow">
            <p className="text-sm text-muted-foreground mb-1">Total Skills</p>
            <p className="text-2xl font-bold text-accent">{overview.total_skills}</p>
          </div>
          <div className="bg-card rounded-lg p-4 card-shadow">
            <p className="text-sm text-muted-foreground mb-1">Avg Skill Level</p>
            <p className="text-2xl font-bold text-foreground">{overview.avg_skill_confidence}/10</p>
          </div>
          <div className="bg-card rounded-lg p-4 card-shadow">
            <p className="text-sm text-muted-foreground mb-1">Hours (30d)</p>
            <p className="text-2xl font-bold text-foreground">{overview.total_hours_month}h</p>
          </div>
        </div>
      )}

      {/* Gap Analysis Trigger */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 card-shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-Powered Gap Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Get personalized insights on your skill development and identify areas for improvement
            </p>
          </div>
          <Button
            onClick={runGapAnalysis}
            disabled={analyzing}
            variant="default"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Skills Radar */}
        <SkillRadarChart skills={skills} />

        {/* Work Distribution Pie Chart */}
        {overview && overview.work_distribution && Object.keys(overview.work_distribution).length > 0 && (
          <div className="bg-card rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              Work Distribution (30 days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={Object.entries(overview.work_distribution).map(([key, value]) => ({
                    name: key,
                    value: value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(overview.work_distribution).map((key, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[key.toLowerCase()] || COLORS.other} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Gap Analysis Results */}
      {gapAnalysis && (
        <div className="space-y-6 animate-slide-up">
          {/* Skill Gaps */}
          {gapAnalysis.gaps && gapAnalysis.gaps.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Skill Gaps to Address
              </h3>
              <div className="space-y-3">
                {gapAnalysis.gaps.map((gap, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{gap.skill}</h4>
                      <Badge
                        variant={gap.priority === 'high' ? 'destructive' : 'secondary'}
                      >
                        {gap.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{gap.reason}</p>
                    <p className="text-sm text-accent font-medium">💡 {gap.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {gapAnalysis.strengths && gapAnalysis.strengths.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Your Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.strengths.map((strength, index) => (
                  <Badge key={index} variant="success" className="text-sm">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {gapAnalysis.recommendations && gapAnalysis.recommendations.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Personalized Recommendations
              </h3>
              <ul className="space-y-2">
                {gapAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Learning Goals */}
          {gapAnalysis.next_learning_goals && gapAnalysis.next_learning_goals.length > 0 && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">🎯 Next Learning Goals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gapAnalysis.next_learning_goals.map((goal, index) => (
                  <div key={index} className="bg-card rounded-lg p-3 border border-border">
                    <p className="text-sm text-foreground">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!gapAnalysis && !analyzing && (
        <div className="bg-card rounded-xl p-12 card-shadow text-center">
          <Target className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Optimize?</h3>
          <p className="text-muted-foreground mb-4">
            Run an AI analysis to get personalized insights on your skill development
          </p>
          <Button onClick={runGapAnalysis} variant="default">
            Get Started
          </Button>
        </div>
      )}
    </AppLayout>
  );
}