import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, Sparkles, Clock, TrendingUp, Calendar } from 'lucide-react';
import { aiAPI } from '../services/api';
import { format } from 'date-fns';

export default function WeeklySummary() {
  const [currentSummary, setCurrentSummary] = useState(null);
  const [previousSummaries, setPreviousSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Fetch previous summaries on page load
  useEffect(() => {
    fetchPreviousSummaries();
  }, []);

  const fetchPreviousSummaries = async () => {
    try {
      setLoadingHistory(true);
      const response = await aiAPI.getSummaries();
      const summaries = Array.isArray(response.data) ? response.data : [];
      setPreviousSummaries(summaries.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ));
    } catch (err) {
      console.error('Error fetching summaries:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiAPI.generateWeeklySummary();
      setCurrentSummary(response.data.summary);
      // Refresh history
      fetchPreviousSummaries();
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AppLayout title="Weekly Summary" subtitle="AI-powered overview of your week">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Summary Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">This Week's Summary</h2>
            <Button
              variant="hero"
              onClick={generateSummary}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>

          {!currentSummary && !loading && (
            <div className="bg-card rounded-xl p-12 card-shadow text-center">
              <FileText className="mx-auto text-accent mb-4 h-12 w-12" />
              <h3 className="text-xl font-bold text-foreground mb-2">Ready for a summary?</h3>
              <p className="text-muted-foreground mb-6">Click the button above to generate your weekly summary.</p>
            </div>
          )}

          {loading && (
            <div className="bg-card rounded-xl p-12 card-shadow text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-foreground text-lg font-medium">Analyzing your week...</p>
            </div>
          )}

          {currentSummary && !loading && (
            <div className="space-y-6">
              {/* Accomplishments */}
              {currentSummary.accomplishments && currentSummary.accomplishments.length > 0 && (
                <div className="bg-card rounded-xl p-6 card-shadow">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Accomplishments
                  </h3>
                  <ul className="space-y-2">
                    {currentSummary.accomplishments.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-foreground">
                        <span className="text-success font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learnings */}
              {currentSummary.learnings && currentSummary.learnings.length > 0 && (
                <div className="bg-card rounded-xl p-6 card-shadow">
                  <h3 className="text-lg font-bold text-foreground mb-4">🎓 Learnings</h3>
                  <ul className="space-y-2">
                    {currentSummary.learnings.map((item, idx) => (
                      <li key={idx} className="text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Blockers Impact */}
              {currentSummary.blockers_impact && currentSummary.blockers_impact.length > 0 && (
                <div className="bg-card rounded-xl p-6 card-shadow border-l-4 border-danger">
                  <h3 className="text-lg font-bold text-foreground mb-4">⚠️ Blockers Impact</h3>
                  <ul className="space-y-2">
                    {currentSummary.blockers_impact.map((item, idx) => (
                      <li key={idx} className="text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Time Breakdown */}
              {currentSummary.time_breakdown && (
                <div className="bg-card rounded-xl p-6 card-shadow">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(currentSummary.time_breakdown).map(([key, value]) => (
                      <div key={key} className="bg-secondary rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        <p className="text-lg font-bold text-foreground">{value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative Summary */}
              {currentSummary.narrative_summary && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                  <p className="text-foreground leading-relaxed italic">
                    "{currentSummary.narrative_summary}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Summaries Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 card-shadow sticky top-4">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Previous Summaries
            </h3>

            {loadingHistory ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : previousSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous summaries yet</p>
            ) : (
              <div className="space-y-2">
                {previousSummaries.map((summary) => (
                  <button
                    key={summary.id}
                    onClick={() => setSelectedHistory(summary)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedHistory?.id === summary.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    <p className="font-medium text-sm">
                      Week of {formatDate(summary.week_start)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      {formatDate(summary.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Selected History Detail */}
            {selectedHistory && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3 text-sm">
                  Week of {formatDate(selectedHistory.week_start)}
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedHistory.summary_json?.narrative_summary && (
                    <p className="text-muted-foreground italic">
                      "{selectedHistory.summary_json.narrative_summary}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Generated: {formatDate(selectedHistory.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}