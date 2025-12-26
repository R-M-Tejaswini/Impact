import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sparkles, Copy, RefreshCw, Check } from 'lucide-react';
import { aiAPI } from '../services/api';
import { format } from 'date-fns';

export default function WeeklySummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateWeeklySummary();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Make sure you have work entries logged!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summary) return;

    const text = `
Weekly Summary - Week of ${format(new Date(), 'MMM dd, yyyy')}

${summary.narrative_summary || ''}

🎯 KEY ACCOMPLISHMENTS:
${summary.accomplishments?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

📚 LEARNING HIGHLIGHTS:
${summary.learnings?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

🚧 BLOCKERS & IMPACT:
${summary.blockers_impact?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

💡 INITIATIVE SHOWN:
${summary.initiative?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

📊 TIME BREAKDOWN:
- Coding: ${summary.time_breakdown?.coding || 0}%
- Meetings: ${summary.time_breakdown?.meetings || 0}%
- Blocked: ${summary.time_breakdown?.blocked || 0}%
- Learning: ${summary.time_breakdown?.learning || 0}%
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout
      title="Weekly Summary"
      subtitle={`Week of ${format(new Date(), 'MMMM dd, yyyy')}`}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button
          variant="hero"
          onClick={generateSummary}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Summary
            </>
          )}
        </Button>

        {summary && (
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        )}
      </div>

      {!summary && !loading && (
        <div className="bg-card rounded-xl p-12 card-shadow text-center animate-fade-in">
          <Sparkles className="mx-auto text-accent mb-4 h-12 w-12" />
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to Impress Your Manager?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click the button above to generate an AI-powered summary of your week's work.
            Perfect for status updates and 1-on-1s!
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-card rounded-xl p-12 card-shadow text-center animate-scale-in">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground text-lg font-medium">AI is analyzing your week...</p>
          <p className="text-muted-foreground text-sm mt-2">This usually takes 5-10 seconds</p>
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Narrative Summary */}
          {summary.narrative_summary && (
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-6 card-shadow border border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">📝 Executive Summary</h3>
              <p className="text-foreground leading-relaxed">{summary.narrative_summary}</p>
            </div>
          )}

          {/* Accomplishments */}
          {summary.accomplishments && summary.accomplishments.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                🎯 Key Accomplishments
              </h4>
              <ul className="space-y-3">
                {summary.accomplishments.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-success/10 border border-success/20"
                  >
                    <span className="text-success font-bold flex-shrink-0">{index + 1}.</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Highlights */}
          {summary.learnings && summary.learnings.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                📚 Learning Highlights
              </h4>
              <ul className="space-y-3">
                {summary.learnings.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <span className="text-primary font-bold flex-shrink-0">{index + 1}.</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers */}
          {summary.blockers_impact && summary.blockers_impact.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                🚧 Blockers & Their Impact
              </h4>
              <ul className="space-y-3">
                {summary.blockers_impact.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20"
                  >
                    <span className="text-danger font-bold flex-shrink-0">{index + 1}.</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Initiative */}
          {summary.initiative && summary.initiative.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                💡 Initiative Shown
              </h4>
              <ul className="space-y-3">
                {summary.initiative.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
                  >
                    <span className="text-accent font-bold flex-shrink-0">{index + 1}.</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Time Breakdown */}
          {summary.time_breakdown && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-4">📊 Time Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.time_breakdown).map(([key, value]) => (
                  <div key={key} className="text-center p-4 rounded-lg bg-secondary">
                    <div className="text-3xl font-bold text-primary">{value}%</div>
                    <div className="text-sm text-muted-foreground capitalize mt-1">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}