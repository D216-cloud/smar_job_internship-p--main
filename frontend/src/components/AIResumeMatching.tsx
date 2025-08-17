import React, { useState, useEffect, useCallback } from 'react';
// import extractPdfText from '../utils/extractPdfText';
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
  TrendingUp,
  AlertTriangle,
  Download,
  Clipboard
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
  onClose
}) => {
  const [matchData, setMatchData] = useState<AIMatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | undefined>();

  // Small inline radial gauge for the fit score
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
          <div className="text-4xl font-bold" style={{ color }}>{clamped}%</div>
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
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
    return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (score >= 60) return <AlertCircle className="w-6 h-6 text-amber-500" />;
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
  };

  const analyzeMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to analyze your resume match');
      }

      // 1. Get the user's resume file URL (simulate or fetch from profile API if needed)
      // For demo, assume resumeUrl is available (replace with actual logic as needed)
      const resumeUrl = null;
      // TODO: fetch resumeUrl from user profile if not passed as prop
      // If you have resumeUrl as a prop or from context, use it here

      const resumeText = '';
      // PDF extraction is disabled because extractPdfText module is missing.
      // If you implement extractPdfText, restore the code below.
      // if (resumeUrl) {
      //   try {
      //     resumeText = await extractPdfText(resumeUrl);
      //   } catch (e) {
      //     console.error('Failed to extract PDF text:', e);
      //     resumeText = '';
      //   }
      // }

      const response = await fetch('/api/ai-matching/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          jobId,
          fastFirst: true,
          resumeText // send extracted text if available
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You can only analyze your own resume');
        } else if (response.status === 503) {
          throw new Error('AI service temporarily unavailable. Please try again later.');
        } else if (response.status === 502) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (!data.match) {
        throw new Error('Invalid response from AI service');
      }

      setMatchData(data.match);
      setSource(data.source);
      toast({
        title: "Analysis Complete",
        description: `Your fit score: ${data.match.fitScore}%`,
        variant: "default",
      });
    } catch (err) {
      console.error('AI Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze match';
      setError(errorMessage);
      const toastVariant: "default" | "destructive" = "destructive";
      let toastDescription = errorMessage;
      if (errorMessage.includes('log in')) {
        toastDescription = 'Please log in to continue';
      } else if (errorMessage.includes('temporarily unavailable')) {
        toastDescription = 'AI service is busy. Please try again in a moment.';
      } else if (errorMessage.includes('Network error')) {
        toastDescription = 'Please check your internet connection';
      }
      toast({
        title: "Analysis Failed",
        description: toastDescription,
        variant: toastVariant,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, jobId]);

  useEffect(() => {
    if (isOpen && userId && jobId) {
      analyzeMatch();
    }
  }, [isOpen, userId, jobId, analyzeMatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-blue-900/90 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="px-8 pt-8 pb-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white"
                >
                  <Brain className="w-8 h-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                    AI Resume Analysis
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
              >
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 space-y-8">
            <AnimatePresence>
        {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex items-center justify-center py-12 bg-gray-50/50 rounded-2xl backdrop-blur-sm"
                >
          {/* Subtle shimmer + ETA */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite] [mask-image:linear-gradient(90deg,transparent,black,transparent)]" />
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(10)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
                        initial={{
                          x: Math.random() * 100 - 50,
                          y: Math.random() * 100 - 50,
                          scale: 0.5,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0.3, 0.8, 0.3],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                        style={{ left: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-10 h-10 text-blue-600" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="text-lg font-medium text-gray-700"
                    >
                      Getting quick result (≈ 1–3s) ...
                    </motion.span>
                    <motion.div
                      className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: "12rem" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-semibold text-red-700">Analysis Error</span>
                  </div>
                  <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                  <Button
                    onClick={analyzeMatch}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    Retry Analysis
                  </Button>
                </motion.div>
              )}

              {matchData && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {source && (
                    <div className="text-center">
                      <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        Source: {source === 'ai' ? 'AI (full)' : 'Instant (local estimate)'}
                      </span>
                    </div>
                  )}
                  {/* Fit Score Section */}
                  <div className="text-center bg-white/90 rounded-2xl p-8 shadow-lg backdrop-blur-sm relative overflow-hidden">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="flex items-center justify-center space-x-3 mb-4"
                    >
                      {getScoreIcon(matchData.fitScore)}
                      <h3 className="text-2xl font-semibold text-gray-900">Resume Fit Score</h3>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-4">
                      <ScoreGauge score={matchData.fitScore} />
                    </motion.div>
                    <Badge className={`text-sm font-semibold px-4 py-2 ${getScoreBadgeColor(matchData.fitScore)} rounded-xl transition-all duration-300 shadow-sm`}>
                      {matchData.fitScore >= 80 ? 'Excellent Match' : 
                       matchData.fitScore >= 60 ? 'Good Match' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <Separator className="bg-gray-200/50" />
                  {/* Detailed Comparison Section */}
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
                    {/* Show what matches between user and job profile */}
                    <div className="mt-4">
                      <h5 className="font-semibold text-green-700 mb-2">Matched Skills/Experience:</h5>
                      {matchData.strengths && matchData.strengths.length > 0 ? (
                        <ul className="list-disc ml-6 text-green-700">
                          {matchData.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">No strong matches found.</span>
                      )}
                      <h5 className="font-semibold text-amber-700 mt-4 mb-2">Missing/Weak Areas:</h5>
                      {matchData.weaknesses && matchData.weaknesses.length > 0 ? (
                        <ul className="list-disc ml-6 text-amber-700">
                          {matchData.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">No major weaknesses detected.</span>
                      )}
                    </div>
                  </motion.div>
                  {/* Recommendations Section */}
                  {matchData.recommendations && matchData.recommendations.length > 0 && (
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
                        {matchData.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{recommendation}</span>
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
                    {/* Quick utilities */}
                    <div className="flex-1 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 text-sm font-semibold shadow-sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`${matchData.summary}\n\nStrengths: ${matchData.strengths.join(', ')}\nWeaknesses: ${matchData.weaknesses.join(', ')}`);
                            toast({ title: 'Copied', description: 'Summary copied to clipboard' });
                          } catch {
                            toast({ title: 'Copy failed', description: 'Unable to copy to clipboard', variant: 'destructive' });
                          }
                        }}
                      >
                        <Clipboard className="w-5 h-5 mr-2" /> Copy Summary
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 text-sm font-semibold shadow-sm"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify({ source, ...matchData }, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `resume-analysis-${jobTitle.replace(/\s+/g,'-').toLowerCase()}.json`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="w-5 h-5 mr-2" /> Download Report
                      </Button>
                    </div>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 text-sm font-semibold shadow-sm"
                    >
                      Continue Application
                    </Button>
                    <Button
                      onClick={analyzeMatch}
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-5 h-5 mr-2" />
                      )}
                      Re-analyze Resume
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