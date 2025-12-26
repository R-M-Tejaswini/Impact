import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Target, Copy, Send, Sparkles, Check } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function OneOnOnePrep() {
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState(null);

  // DO NOT use useEffect to call generatePrep on page load
  // Only call when user clicks the button

  const generatePrep = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiAPI.generateOneOnOnePrep();
      setPrep(response.data);
    } catch (error) {
      console.error('Error generating prep:', error);
      setError('Failed to generate 1-on-1 prep. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!prep) return;

    const text = `
1-on-1 Talking Points - ${new Date().toLocaleDateString()}

✨ WINS TO SHARE:
${prep.wins?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

🆘 HELP NEEDED:
${prep.help_needed?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

❓ QUESTIONS TO ASK:
${prep.questions?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}

📈 GROWTH REQUESTS:
${prep.growth_requests?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'None'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskCoach = async () => {
    if (!aiQuery.trim()) return;
    setIsAsking(true);
    setAiResponse('');
    
    // Simulate AI response locally for now
    setTimeout(() => {
      setAiResponse(
        `Great question! Here's a suggested approach:\n\n"${aiQuery}"\n\nConsider framing this around your recent accomplishments and specific examples from your work.`
      );
      setIsAsking(false);
    }, 1500);
  };

  return (
    <AppLayout title="1-on-1 Prep Assistant" subtitle="Prepare talking points for your next meeting">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Button
          variant="hero"
          onClick={generatePrep}
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
              Generate Prep
            </>
          )}
        </Button>

        {prep && (
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        )}
      </div>

      {!prep && !loading && (
        <div className="bg-card rounded-xl p-12 card-shadow text-center">
          <Sparkles className="mx-auto text-accent mb-4 h-12 w-12" />
          <h3 className="text-xl font-bold text-foreground mb-2">Ready for Your 1-on-1?</h3>
          <p className="text-muted-foreground mb-6">Click the button above to generate talking points.</p>
        </div>
      )}

      {loading && (
        <div className="bg-card rounded-xl p-12 card-shadow text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground text-lg font-medium">Preparing your talking points...</p>
        </div>
      )}

      {prep && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wins */}
          {prep.wins && prep.wins.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-3">✨ WINS TO SHARE</h4>
              <ul className="space-y-3">
                {prep.wins.map((item, index) => (
                  <li key={index} className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <span className="text-success font-bold">{index + 1}.</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help Needed */}
          {prep.help_needed && prep.help_needed.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-3">🆘 HELP NEEDED</h4>
              <ul className="space-y-3">
                {prep.help_needed.map((item, index) => (
                  <li key={index} className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                    <span className="text-danger font-bold">{index + 1}.</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions */}
          {prep.questions && prep.questions.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-3">❓ QUESTIONS</h4>
              <ul className="space-y-3">
                {prep.questions.map((item, index) => (
                  <li key={index} className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-primary font-bold">{index + 1}.</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Growth Requests */}
          {prep.growth_requests && prep.growth_requests.length > 0 && (
            <div className="bg-card rounded-xl p-6 card-shadow">
              <h4 className="text-lg font-bold text-foreground mb-3">📈 GROWTH REQUESTS</h4>
              <ul className="space-y-3">
                {prep.growth_requests.map((item, index) => (
                  <li key={index} className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-accent font-bold">{index + 1}.</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}