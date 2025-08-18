import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Download,
  Clipboard,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIMatchData {
  fitScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  matchedCriteria?: string[];
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
  const [source, setSource] = useState<'ai' | 'fallback' | undefined>();

  // ✅ Radial Gauge with AI glow effect
  const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 70;
    const stroke = 14;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const clamped = Math.max(0, Math.min(100, score));
    const offset = circumference - (clamped / 100) * circumference;
    const color =
      clamped >= 80 ? '#10b981' : clamped >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div className="relative w-48 h-48 mx-auto">
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
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ boxShadow: `0 0 30px ${color}` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`text-5xl font-bold transition-colors duration-700`}
            style={{ color }}
          >
            {Math.round(clamped)}%
          </div>
          <div className="text-xs text-gray-500 font-medium tracking-wider">Fit Score</div>
        </div>
      </div>
    );
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Moderate Match';
    return 'Low Match';
  };

  // ✅ AI Assistant Character (simple SVG robot with animation)
  const AIAvatar = () => (
    <motion.div
      className="relative w-20 h-20"
      animate={{
        y: [-5, 0, -5],
        scale: [0.98, 1.02, 0.98],
      }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <motion.circle
          cx="50"
          cy="40"
          r="20"
          fill="#3B82F6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Eyes */}
        <circle cx="44" cy="37" r="3" fill="white" />
        <circle cx="56" cy="37" r="3" fill="white" />
        <motion.circle
          cx="44"
          cy="37"
          r="1.5"
          fill="#000"
          animate={{ x: [0, 1, 0], y: [0, -0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <motion.circle
          cx="56"
          cy="37"
          r="1.5"
          fill="#000"
          animate={{ x: [0, 1, 0], y: [0, -0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
        />
        {/* Mouth */}
        <motion.path
          d="M45 48 Q50 52 55 48"
          stroke="#fff"
          strokeWidth="2"
          fill="transparent"
          animate={{ d: ["M45 48 Q50 52 55 48", "M45 48 Q50 46 55 48", "M45 48 Q50 52 55 48"] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Body */}
        <rect x="35" y="60" width="30" height="30" rx="8" fill="#1E40AF" />
        {/* Antenna */}
        <line x1="50" y1="40" x2="50" y2="25" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="50" cy="25" r="3" fill="#EC4899" />
        {/* Glow pulse */}
        <motion.circle
          cx="50"
          cy="25"
          r="6"
          fill="#EC4899"
          opacity={0.3}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </svg>
    </motion.div>
  );

  const analyzeMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;
    const maxAttempts = 6;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to analyze your resume match');

      const fetchResult = async () => {
        const response = await fetch('/api/ai-matching/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, jobId, fastFirst: true, resumeText: '' }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 403) throw new Error('You can only analyze your own resume');
          else if (response.status === 503) throw new Error('AI service temporarily unavailable');
          else if (response.status === 502) throw new Error('Network error. Check connection');
          else if (data.error?.includes('deepseek-unauthorized'))
            throw new Error('AI service authorization failed. Contact admin.');
          throw new Error(data.error || `Server error (${response.status})`);
        }
        if (!data.match) throw new Error('Invalid response from AI service');
        return data;
      };

      let data = await fetchResult();
      setSource(data.source);

      while (data.source === 'fallback' && attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 2000));
        data = await fetchResult();
        setSource(data.source);
        attempts++;
      }

      // ✅ Log full AI result to console for local debugging
      console.group('🎯 AI Resume Matching Result (Debug View)');
      console.log('Job:', jobTitle);
      console.log('Company:', companyName);
      console.log('Fit Score:', `${data.match.fitScore}%`);
      console.log('Source:', data.source === 'ai' ? 'DeepSeek AI' : 'Local Fallback');
      console.log('Summary:', data.match.summary);
      console.log('Matched Criteria:', data.match.matchedCriteria || []);
      console.log('Strengths:', data.match.strengths);
      console.log('Weaknesses:', data.match.weaknesses);
      console.log('Recommendations:', data.match.recommendations);
      console.groupEnd();

      setMatchData(data.match);
      toast({
        title: 'Analysis Complete 🎉',
        description: `Your AI fit score: ${data.match.fitScore}%`,
        variant: 'default',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze match';
      setError(message);
      toast({
        title: 'Analysis Failed',
        description: message.includes('log in')
          ? 'Please log in to continue'
          : message.includes('temporarily unavailable')
          ? 'AI service is busy. Try again later.'
          : 'Check your connection and retry.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, jobId, jobTitle, companyName]);

  useEffect(() => {
    if (isOpen && userId && jobId) {
      analyzeMatch();
    }
  }, [isOpen, userId, jobId, analyzeMatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="px-8 pt-8 pb-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg"
                >
                  <Brain className="w-8 h-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                    AI Resume Match
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {jobTitle} at <span className="font-semibold text-blue-600">{companyName}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-10 h-10 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-8">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-blue-50/40 to-white/60 rounded-2xl backdrop-blur-sm border border-blue-100"
                >
                  {/* AI Assistant */}
                  <AIAvatar />
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-semibold text-gray-700 mt-6"
                  >
                    Analyzing your resume...
                  </motion.h3>
                  <p className="text-gray-500 text-sm mt-1">AI is comparing your skills with {jobTitle}</p>

                  {/* Progress bar with shimmer */}
                  <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-6 relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      animate={{ width: ['0%', '70%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Typical wait: 1–3 seconds</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
                >
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-red-700">Analysis Failed</h3>
                  <p className="text-red-600 text-sm mt-2 leading-relaxed">{error}</p>
                  <Button
                    onClick={analyzeMatch}
                    className="mt-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </motion.div>
              )}

              {matchData && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Source Tag */}
                  {source && (
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs px-3 py-1 rounded-full ${
                          source === 'ai'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {source === 'ai' ? '✅ Full AI Analysis' : '⚡ Instant Estimate'}
                      </Badge>
                    </div>
                  )}

                  {/* Score Section */}
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <ScoreGauge score={matchData.fitScore} />
                    <Badge
                      variant={getScoreBadgeVariant(matchData.fitScore)}
                      className="mt-4 text-sm px-4 py-1"
                    >
                      {getScoreLabel(matchData.fitScore)}
                    </Badge>
                  </div>

                  <Separator className="my-6 border-gray-200" />

                  {/* Matched Criteria */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-green-100"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h4 className="text-xl font-semibold text-gray-900">Matched Criteria</h4>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                      {(matchData.matchedCriteria && matchData.matchedCriteria.length > 0
                        ? matchData.matchedCriteria
                        : matchData.strengths
                      ).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Summary */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Target className="w-6 h-6 text-blue-600" />
                      <h4 className="text-xl font-semibold text-gray-900">Match Summary</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">{matchData.summary}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" /> Strengths
                        </h5>
                        <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                          {matchData.strengths.length > 0 ? (
                            matchData.strengths.map((s, i) => <li key={i}>{s}</li>)
                          ) : (
                            <li className="text-gray-500">No standout strengths detected</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-amber-700 flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5" /> Areas to Improve
                        </h5>
                        <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                          {matchData.weaknesses.length > 0 ? (
                            matchData.weaknesses.map((w, i) => <li key={i}>{w}</li>)
                          ) : (
                            <li className="text-gray-500">No critical weaknesses found</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  {matchData.recommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        <h4 className="text-xl font-semibold text-gray-900">How to Improve</h4>
                      </div>
                      <div className="space-y-3">
                        {matchData.recommendations.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                          >
                            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm">{rec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 pt-4"
                  >
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${matchData.summary}\n\nStrengths: ${matchData.strengths.join(', ')}\nWeaknesses: ${matchData.weaknesses.join(', ')}`
                          );
                          toast({ title: '📋 Copied!', description: 'Summary copied to clipboard.' });
                        } catch {
                          toast({ title: '❌ Copy failed', variant: 'destructive' });
                        }
                      }}
                    >
                      <Clipboard className="w-5 h-5" /> Copy Summary
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({ source, ...matchData }, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `match-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: '📥 Downloaded', description: 'Report saved.' });
                      }}
                    >
                      <Download className="w-5 h-5" /> Download JSON
                    </Button>
                    <Button
                      onClick={onClose}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
                    >
                      Continue →
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