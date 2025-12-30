import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SkillRadarChart({ skills }) {
  // Transform skills data for radar chart
  const chartData = skills.slice(0, 8).map(skill => ({
    skill: skill.skill_name,
    level: skill.confidence_level,
    fullMark: 10,
  }));

  if (!skills || skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-card rounded-xl card-shadow">
        <p className="text-muted-foreground">No skills tracked yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Skills Radar</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Radar
            name="Skill Level"
            dataKey="level"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Showing top {Math.min(skills.length, 8)} skills
      </div>
    </div>
  );
}