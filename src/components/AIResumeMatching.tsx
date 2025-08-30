import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Download,
  Clipboard,
  X,
  Terminal,
  Zap,
  Info,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIMatchData {
  fitScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface AIResumeMatchingProps {
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AIResumeMatching: React.FC<AIResumeMatchingProps> = ({
  userId,
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
}) => {
  const [matchData, setMatchData] = useState<AIMatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [showStructuredUI, setShowStructuredUI] = useState(false);
  const terminalRef = useRef<HTMLPreElement>(null);

  const appendTerminalLine = useCallback((line: string) => {
    setTerminalOutput((prev) => [...prev, line]);
  }, []);

  // Score Gauge Component
  const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const clamped = Math.max(0, Math.min(100, score));
    const offset = circumference - (clamped / 100) * circumference;
    const color = clamped >= 80 ? '#10b981' : clamped >= 60 ? '#f59e0b' : '#ef4444';
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color }}>
            {clamped}%
          </div>
          <div className="text-xs text-gray-500">Fit score</div>
        </div>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
    if (score >= 60)
      return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
    return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-amber-500" />;
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  // Simulate AI thinking steps
  const simulateProgress = async (steps: { label: string; delay: number }[]) => {
    for (const step of steps) {
      setProgressLabel(step.label);
      setProgress((prev) => Math.min(prev + 25, 100));
      await new Promise((r) => setTimeout(r, step.delay));
    }
  };

  // Normalize AI response
  const normalizeMatch = (raw: unknown): AIMatchData => {
    const r = raw as Record<string, unknown>;
    const fit = Number(r['fitScore'] ?? r['score'] ?? r['matchScore'] ?? 0) || 0;
    const fitScore = Math.max(0, Math.min(100, fit));
    const summary = ((r['summary'] ?? r['summaryText'] ?? '') as string).trim();

    const strengths = [
      ...(Array.isArray(r['strengths']) ? (r['strengths'] as string[]) : []),
      ...(Array.isArray(r['matchedSkills']) ? (r['matchedSkills'] as string[]) : []),
      ...(Array.isArray(r['matched']) ? (r['matched'] as string[]) : []),
    ].filter((s, i, arr) => s && arr.indexOf(s) === i);

    const weaknesses = [
      ...(Array.isArray(r['weaknesses']) ? (r['weaknesses'] as string[]) : []),
      ...(Array.isArray(r['missingSkills']) ? (r['missingSkills'] as string[]) : []),
      ...(Array.isArray(r['notMatched']) ? (r['notMatched'] as string[]) : []),
    ].filter((s, i, arr) => s && arr.indexOf(s) === i);

    const recommendations = [
      ...(Array.isArray(r['recommendations']) ? (r['recommendations'] as string[]) : []),
      ...(Array.isArray(r['suggestions']) ? (r['suggestions'] as string[]) : []),
    ].filter((s, i, arr) => s && arr.indexOf(s) === i);

    return { fitScore, summary, strengths, weaknesses, recommendations };
  };

  const analyzeMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTerminalOutput([]);
    setMatchData(null);
    setSavedMatchId(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      appendTerminalLine('\n🤖 Initializing DeepSeek AI Analysis...');
      appendTerminalLine(`\n📋 Processing Job Details:`);
      appendTerminalLine(`   Title: ${jobTitle}`);
      appendTerminalLine(`   Company: ${companyName}`);
      appendTerminalLine('\n⏳ Waiting for AI response...\n');

      const response = await fetch('/api/ai-matching/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          appendTerminalLine('\n❌ Error: Access denied. You can only analyze your own resume.');
          throw new Error('You can only analyze your own resume');
        } else if (response.status === 503) {
          appendTerminalLine('\n❌ Error: DeepSeek AI is currently busy. Please try again later.');
          throw new Error('AI service is temporarily busy. Please try again.');
        } else if (response.status === 502) {
          appendTerminalLine('\n❌ Error: Unable to reach AI service. Please check your connection.');
          throw new Error('Network error. Please check your connection.');
        }
        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (!data.match) {
        appendTerminalLine('\n❌ Error: Invalid AI response received.');
        throw new Error('Invalid response from AI service');
      }

      // Clear previous output and show AI is processing
      appendTerminalLine('\n🧠 DeepSeek AI analyzing resume...');
      
      const normalized = normalizeMatch(data.match);
      setMatchData(normalized);
      if (data.matchId) setSavedMatchId(data.matchId);
      
      // Show that AI has completed its analysis
      appendTerminalLine('\n✨ AI Analysis Complete!');

      // Display AI analysis results in terminal format
      appendTerminalLine('\n🤖 DeepSeek AI Analysis Results\n');
      appendTerminalLine('📊 Position Analysis:');
      appendTerminalLine(`   Role: ${jobTitle}`);
      appendTerminalLine(`   Organization: ${companyName}\n`);

      appendTerminalLine(
        `🎯 AI Match Score: ${normalized.fitScore}% ${
          normalized.fitScore >= 80 ? '🟢 Excellent Match' : 
          normalized.fitScore >= 60 ? '🟡 Good Potential' : 
          '🔴 Improvement Needed'
        }\n`
      );

      appendTerminalLine('📝 AI Summary Analysis:');
      appendTerminalLine(normalized.summary);

      if (normalized.strengths.length > 0) {
        appendTerminalLine('\n💪 AI-Identified Key Strengths:');
        normalized.strengths.forEach((strength) => appendTerminalLine(`  ✓ ${strength}`));
      }

      if (normalized.weaknesses.length > 0) {
        appendTerminalLine('\n🎯 AI-Suggested Improvement Areas:');
        normalized.weaknesses.forEach((weakness) => appendTerminalLine(`  ! ${weakness}`));
      }

      if (normalized.recommendations.length > 0) {
        appendTerminalLine('\n💡 AI-Generated Recommendations:');
        normalized.recommendations.forEach((rec) => appendTerminalLine(`  > ${rec}`));
      }

      appendTerminalLine('\n📊 Analysis Details:');
      appendTerminalLine(`  AI Session ID: ${data.matchId || 'Not Available'}`);
      appendTerminalLine(`  Analysis Completed: ${new Date().toLocaleString()}`);
      appendTerminalLine('\n✨ DeepSeek AI Analysis Complete\n');

      toast({
        title: 'Analysis Complete',
        description: `Fit score: ${normalized.fitScore}%`,
        variant: 'default',
      });
    } catch (err) {
      console.error('AI Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Failed to analyze match';
      setError(message);

      toast({
        title: 'Analysis Failed',
        description: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>
              {message.includes('log in')
                ? 'Please log in to continue'
                : message.includes('busy')
                ? 'AI service is busy. Try again later.'
                : message.includes('Network')
                ? 'Check your internet connection'
                : message}
            </span>
          </div>
        ),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, jobId, jobTitle, companyName, appendTerminalLine]);

  useEffect(() => {
    if (isOpen && userId && jobId) {
      analyzeMatch();
    }
  }, [isOpen, userId, jobId, analyzeMatch]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current && terminalOutput.length) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-blue-900/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 flex flex-col h-full">
          <CardHeader className="px-8 pt-8 pb-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg"
                >
                  <Terminal className="w-8 h-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                    Job Match Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 font-medium tracking-wide">
                    {jobTitle} at {companyName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full w-10 h-10 transition-all duration-300"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4 space-y-8 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Terminal Output */}
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Terminal className="w-5 h-5 text-blue-500" />
                    <span>AI Terminal</span>
                  </div>
                  {loading && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-500">Processing...</span>
                    </div>
                  )}
                </div>

                <motion.pre
                  ref={terminalRef}
                  className="whitespace-pre-wrap font-mono text-sm bg-black text-green-400 p-6 rounded-2xl overflow-auto max-h-[60vh] min-h-40"
                >
                  {terminalOutput.join('\n')}
                </motion.pre>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <div className="flex-1 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(terminalOutput.join('\n'));
                          toast({
                            title: 'Copied',
                            description: 'Analysis copied to clipboard.',
                          });
                        } catch {
                          toast({
                            title: 'Copy failed',
                            description: 'Could not copy output.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="h-10"
                      disabled={loading || !terminalOutput.length}
                    >
                      <Clipboard className="w-4 h-4 mr-2" /> Copy Output
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([terminalOutput.join('\n')], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `job-match-analysis-${new Date().toISOString()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                      className="h-10"
                      disabled={loading || !terminalOutput.length}
                    >
                      <Download className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                  <Button onClick={onClose} variant="outline" size="sm" className="h-10">
                    <X className="w-4 h-4 mr-2" /> Close
                  </Button>
                  {error && (
                    <Button
                      onClick={analyzeMatch}
                      disabled={loading}
                      size="sm"
                      className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" /> Retry Analysis
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Fallback Structured UI */}
              {matchData && terminalOutput.length === 0 && (
                <motion.div
                  key="structured"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Score Card */}
                  <div className="text-center bg-white/90 rounded-2xl p-8 shadow-lg backdrop-blur-sm relative overflow-hidden">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                      className="flex items-center justify-center space-x-3 mb-4"
                    >
                      {getScoreIcon(matchData.fitScore)}
                      <h3 className="text-2xl font-semibold text-gray-900">Resume Fit Score</h3>
                    </motion.div>
                    <ScoreGauge score={matchData.fitScore} />
                    <Badge
                      className={`text-sm font-semibold px-4 py-2 mt-4 ${getScoreBadgeColor(
                        matchData.fitScore
                      )} rounded-xl shadow-sm`}
                    >
                      {matchData.fitScore >= 80
                        ? 'Excellent Match'
                        : matchData.fitScore >= 60
                        ? 'Good Match'
                        : 'Needs Improvement'}
                    </Badge>
                  </div>

                  <Separator className="bg-gray-200/50" />

                  {/* Match Summary */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Target className="w-6 h-6 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Match Summary</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{matchData.summary}</p>
                  </motion.div>

                  {/* Strengths */}
                  {matchData.strengths.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h4 className="text-lg font-semibold text-gray-900">Key Strengths</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchData.strengths.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                          >
                            <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> {s}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Weaknesses */}
                  {matchData.weaknesses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        <h4 className="text-lg font-semibold text-gray-900">Areas for Improvement</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchData.weaknesses.map((w, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                          >
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> {w}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Recommendations */}
                  {matchData.recommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        <h4 className="text-lg font-semibold text-gray-900">Recommendations</h4>
                      </div>
                      <div className="space-y-3">
                        {matchData.recommendations.map((rec, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{rec}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 pt-6"
                  >
                    <div className="flex-1 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `${matchData.summary}\n\nStrengths: ${matchData.strengths.join(
                                ', '
                              )}\nWeaknesses: ${matchData.weaknesses.join(', ')}`
                            );
                            toast({ title: 'Copied', description: 'Summary copied.' });
                          } catch {
                            toast({
                              title: 'Copy failed',
                              description: 'Could not copy.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="h-10"
                      >
                        <Clipboard className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(matchData, null, 2)], {
                            type: 'application/json',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `resume-analysis-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                        className="h-10"
                      >
                        <Download className="w-4 h-4 mr-2" /> Export
                      </Button>
                    </div>
                    <Button onClick={onClose} variant="outline" size="sm" className="flex-1 h-10">
                      Continue
                    </Button>
                    <Button
                      onClick={analyzeMatch}
                      disabled={loading}
                      size="sm"
                      className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span className="ml-1">Re-analyze</span>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIResumeMatching;