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
  Zap,
  Info,
  UploadCloud,
  FileText,
  Server,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
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
  aiProcessingStep?: string;
  setAiProcessingStep?: (step: string) => void;
  simulateAiProcessing?: () => Promise<void>;
  stepGifs?: Record<string, string>;
}

const AIResumeMatching: React.FC<AIResumeMatchingProps> = ({
  userId,
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
  aiProcessingStep,
  setAiProcessingStep,
  simulateAiProcessing,
  stepGifs,
}) => {
  const [matchData, setMatchData] = useState<AIMatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isStrengthsExpanded, setIsStrengthsExpanded] = useState(true);
  const [isWeaknessesExpanded, setIsWeaknessesExpanded] = useState(true);
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(true);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalFilter, setTerminalFilter] = useState<'all' | 'success' | 'error' | 'data' | 'info'>('all');
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

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

  // Add log to terminal
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'data' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
      success: '✅',
      error: '❌',
      data: '📊',
      warning: '⚠️',
      info: '🔍'
    }[type];
    
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    setTerminalLogs(prev => [...prev, logMessage]);
    
    // Auto-scroll terminal to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  // Copy logs to clipboard
  const copyLogsToClipboard = async () => {
    try {
      const logsText = terminalLogs.join('\n');
      await navigator.clipboard.writeText(logsText);
      toast({ 
        title: 'Logs Copied', 
        description: 'Terminal logs copied to clipboard successfully.',
        variant: 'default'
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy logs to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // Download logs as file
  const downloadLogs = () => {
    const logsText = terminalLogs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-matching-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Filter logs by type
  const getLogsByType = (type: string) => {
    return terminalLogs.filter(log => {
      switch(type) {
        case 'success': return log.includes('✅');
        case 'error': return log.includes('❌');
        case 'data': return log.includes('📊');
        case 'warning': return log.includes('⚠️');
        default: return log.includes('🔍');
      }
    });
  };

  const analyzeMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMatchData(null);
    setSavedMatchId(null);
    setProgress(0);
    setTerminalLogs([]);

    addLog('🚀 Starting AI Resume Matching Analysis...', 'info');
    addLog(`📋 Job: ${jobTitle} at ${companyName}`, 'info');
    addLog(`👤 User ID: ${userId}`, 'info');
    addLog(`🔗 Job ID: ${jobId}`, 'info');

    if (setAiProcessingStep && simulateAiProcessing) {
      setAiProcessingStep('uploading');
      addLog('📤 Uploading resume for processing...', 'info');
      await simulateAiProcessing();
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('❌ Authentication required. Please log in.', 'error');
        throw new Error('Authentication required. Please log in.');
      }

      addLog('🔐 Token found, preparing API request...', 'info');
      addLog('🌐 Sending request to /api/ai-matching/match', 'info');

      const requestBody = { userId, jobId };
      addLog(`📤 Request body: ${JSON.stringify(requestBody, null, 2)}`, 'data');

      const response = await fetch('/api/ai-matching/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      addLog(`📨 Response status: ${response.status} ${response.statusText}`, 'info');

      const data = await response.json();
      addLog(`📊 Raw response data: ${JSON.stringify(data, null, 2)}`, 'data');

      if (!response.ok) {
        if (response.status === 403) {
          addLog('🚫 Authorization failed: You can only analyze your own resume', 'error');
          throw new Error('You can only analyze your own resume');
        } else if (response.status === 503) {
          addLog('⏳ AI service is currently busy. Please try again later.', 'error');
          throw new Error('AI service is currently busy. Please try again later.');
        } else if (response.status === 502) {
          addLog('🔌 Unable to reach AI service. Please check your connection.', 'error');
          throw new Error('Unable to reach AI service. Please check your connection.');
        }
        addLog(`❌ Server error: ${data.error || response.status}`, 'error');
        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (!data.match) {
        addLog('❌ Invalid response from AI service - no match data found', 'error');
        throw new Error('Invalid response from AI service');
      }

      addLog('🧠 Processing AI response...', 'info');
      addLog(`🎯 Raw AI match data: ${JSON.stringify(data.match, null, 2)}`, 'data');

      const normalized = normalizeMatch(data.match);
      addLog(`✅ Successfully parsed AI response: ${JSON.stringify(normalized, null, 2)}`, 'success');
      
      setMatchData(normalized);
      if (data.matchId) {
        setSavedMatchId(data.matchId);
        addLog(`💾 Match saved with ID: ${data.matchId}`, 'success');
      }

      addLog(`🎯 Final AI Analysis Result: { fitScore: ${normalized.fitScore}, jobTitle: '${jobTitle}' }`, 'success');

      toast({
        title: 'Analysis Complete',
        description: `Fit score: ${normalized.fitScore}%`,
        variant: 'default',
      });
    } catch (err) {
      console.error('AI Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Failed to analyze match';
      addLog(`💥 Analysis failed: ${message}`, 'error');
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
      addLog('🏁 Analysis process completed', 'info');
    }
  }, [userId, jobId, jobTitle, companyName, setAiProcessingStep, simulateAiProcessing]);

  useEffect(() => {
    if (isOpen && userId && jobId) {
      analyzeMatch();
    }
  }, [isOpen, userId, jobId, analyzeMatch]);

  // Score Gauge Component
  const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 70;
    const stroke = 14;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const clamped = Math.max(0, Math.min(100, score));
    const offset = circumference - (clamped / 100) * circumference;
    const color = clamped >= 80 ? '#10b981' : clamped >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#ffffff1a"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-40"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            stroke={color}
            fill="transparent"
            strokeLinecap="round"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {clamped}%
          </div>
          <div className="text-sm text-gray-300 mt-1">Fit Score</div>
        </div>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30';
    if (score >= 60)
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30';
    return 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-amber-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/40 to-blue-900/90 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              scale: 0.5,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 30px -15px rgba(148, 163, 184, 0.1)',
        }}
      >
        <Card className="border-0 flex flex-col h-full">
          <CardHeader className="px-8 pt-8 pb-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="p-3 bg-gradient-to-r from-blue-500/30 to-purple-600/30 backdrop-blur-sm rounded-xl text-white shadow-lg border border-white/20"
                >
                  <Brain className="w-8 h-8 text-blue-200" />
                </motion.div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    AI Resume Match
                  </CardTitle>
                  <p className="text-sm text-gray-300 mt-1 font-medium tracking-wide">
                    {jobTitle} at {companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg px-3 h-8 transition-all duration-300 border border-white/10"
                  aria-label="Toggle terminal"
                >
                  <Terminal className="w-4 h-4 mr-1" />
                  {showTerminal ? 'Hide' : 'Show'} Logs
                  {showTerminal ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 transition-all duration-300 border border-white/10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Enhanced Terminal Logs Section */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: terminalMaximized ? '60vh' : 'auto', 
                  opacity: 1 
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`mx-8 mb-4 overflow-hidden ${terminalMaximized ? 'fixed inset-4 z-50 mx-0 my-0' : ''}`}
              >
                <div className={`bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden ${terminalMaximized ? 'h-full' : ''}`}>
                  {/* Terminal Header */}
                  <div className="bg-gray-800/80 border-b border-gray-700/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Terminal Traffic Lights */}
                        <div className="flex space-x-1.5">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-gray-300 font-mono">
                            AI-Processing-Terminal ~/gemini-analysis
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Log Stats */}
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Badge className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5">
                            ✅ {getLogsByType('success').length}
                          </Badge>
                          <Badge className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5">
                            ❌ {getLogsByType('error').length}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5">
                            📊 {getLogsByType('data').length}
                          </Badge>
                          <Badge className="bg-gray-500/20 text-gray-300 text-xs px-2 py-0.5">
                            Total: {terminalLogs.length}
                          </Badge>
                        </div>

                        {/* Terminal Controls */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTerminalMaximized(!terminalMaximized)}
                          className="text-gray-400 hover:text-white text-xs h-6 px-2"
                          title={terminalMaximized ? "Minimize" : "Maximize"}
                        >
                          {terminalMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyLogsToClipboard}
                          className="text-gray-400 hover:text-white text-xs h-6 px-2"
                          title="Copy Logs"
                        >
                          <Clipboard className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadLogs}
                          className="text-gray-400 hover:text-white text-xs h-6 px-2"
                          title="Download Logs"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTerminalLogs([])}
                          className="text-gray-400 hover:text-white text-xs h-6 px-2"
                          title="Clear Logs"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        {terminalMaximized && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTerminalMaximized(false)}
                            className="text-gray-400 hover:text-white text-xs h-6 px-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Terminal Filters & Search */}
                    <div className="flex items-center justify-between mt-3 space-x-3">
                      <div className="flex items-center space-x-2">
                        <Filter className="w-3 h-3 text-gray-400" />
                        <select
                          value={terminalFilter}
                          onChange={(e) => setTerminalFilter(e.target.value as 'all' | 'success' | 'error' | 'data' | 'info')}
                          className="bg-gray-700/50 border border-gray-600/50 rounded text-xs text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="all">All Logs ({terminalLogs.length})</option>
                          <option value="success">Success ({getLogsByType('success').length})</option>
                          <option value="error">Errors ({getLogsByType('error').length})</option>
                          <option value="data">Data ({getLogsByType('data').length})</option>
                          <option value="info">Info ({getLogsByType('info').length})</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-1 max-w-md">
                        <Search className="w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search logs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-gray-700/50 border border-gray-600/50 rounded text-xs text-gray-300 px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terminal Content */}
                  <div 
                    ref={terminalRef}
                    className={`bg-black/60 p-4 font-mono text-xs leading-relaxed overflow-y-auto ${
                      terminalMaximized ? 'h-full' : 'h-64'
                    }`}
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #1f2937' }}
                  >
                    {terminalLogs.length === 0 ? (
                      <div className="text-gray-500 italic flex items-center justify-center h-full">
                        <div className="text-center">
                          <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <div>Terminal ready for AI processing 🚀</div>
                          <div className="text-xs mt-1">Logs will appear here during analysis</div>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        // Filter logs based on type and search term
                        let filteredLogs = terminalLogs;
                        
                        if (terminalFilter !== 'all') {
                          filteredLogs = getLogsByType(terminalFilter);
                        }
                        
                        if (searchTerm) {
                          filteredLogs = filteredLogs.filter(log => 
                            log.toLowerCase().includes(searchTerm.toLowerCase())
                          );
                        }

                        return filteredLogs.length === 0 ? (
                          <div className="text-gray-500 italic text-center py-8">
                            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <div>No logs match your filter criteria</div>
                            <div className="text-xs mt-1">Try adjusting your search or filter</div>
                          </div>
                        ) : (
                          filteredLogs.map((log, index) => {
                            const originalIndex = terminalLogs.indexOf(log);
                            const isJson = log.includes('{') && log.includes('}');
                            
                            return (
                              <motion.div
                                key={originalIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`mb-2 group hover:bg-gray-800/30 rounded px-2 py-1 transition-colors ${
                                  log.includes('✅') ? 'text-green-400 border-l-2 border-green-500/30 pl-3' :
                                  log.includes('❌') ? 'text-red-400 border-l-2 border-red-500/30 pl-3' :
                                  log.includes('📊') ? 'text-blue-400 border-l-2 border-blue-500/30 pl-3' :
                                  log.includes('⚠️') ? 'text-yellow-400 border-l-2 border-yellow-500/30 pl-3' :
                                  log.includes('🔍') ? 'text-gray-300 border-l-2 border-gray-500/30 pl-3' :
                                  'text-gray-300'
                                }`}
                              >
                                {isJson ? (
                                  <details className="cursor-pointer">
                                    <summary className="hover:text-white transition-colors">
                                      {log.split('{')[0]}
                                      <span className="text-blue-300 ml-1">[JSON Data - Click to expand]</span>
                                    </summary>
                                    <pre className="mt-2 ml-4 text-blue-300 bg-blue-900/20 p-2 rounded text-xs overflow-x-auto">
                                      {(() => {
                                        try {
                                          const jsonStart = log.indexOf('{');
                                          const jsonStr = log.substring(jsonStart);
                                          return JSON.stringify(JSON.parse(jsonStr), null, 2);
                                        } catch {
                                          return log.substring(log.indexOf('{'));
                                        }
                                      })()}
                                    </pre>
                                  </details>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <span className="flex-1">
                                      {searchTerm ? (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: log.replace(
                                              new RegExp(`(${searchTerm})`, 'gi'),
                                              '<mark class="bg-yellow-400/30 text-yellow-200 px-1 rounded">$1</mark>'
                                            )
                                          }}
                                        />
                                      ) : (
                                        log
                                      )}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigator.clipboard.writeText(log)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white h-4 w-4 p-0 ml-2"
                                      title="Copy line"
                                    >
                                      <Clipboard className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })
                        );
                      })()
                    )}
                  </div>

                  {/* Terminal Footer */}
                  <div className="bg-gray-800/50 border-t border-gray-700/50 px-4 py-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Real-time processing logs from Gemini AI</span>
                        <span>•</span>
                        <span>Auto-scroll enabled</span>
                        {searchTerm && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400">Searching: "{searchTerm}"</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Lines: {terminalLogs.length}</span>
                        {terminalFilter !== 'all' && (
                          <>
                            <span>•</span>
                            <span>Filtered: {getLogsByType(terminalFilter).length}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <CardContent className="px-8 pb-8 pt-4 space-y-8 flex-1 overflow-y-auto">
            {/* Loading / Processing State */}
            {loading && !matchData && (
              <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center">
                {/* Step Indicator */}
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={stepGifs?.[aiProcessingStep || 'uploading'] || 'https://media.giphy.com/media/l0HlNcJZ7oq8j6X9W/giphy.gif'}
                      alt={`Processing: ${aiProcessingStep || 'uploading'}`}
                      className="w-28 h-28 object-contain rounded-2xl shadow-2xl"
                      style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                    />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-medium">
                      {aiProcessingStep === 'uploading' && '📄 Uploading Resume...'}
                      {aiProcessingStep === 'extracting' && '🔍 Extracting Text...'}
                      {aiProcessingStep === 'sending' && '📡 Sending to Gemini...'}
                      {aiProcessingStep === 'analyzing' && '🧠 Analyzing Skills...'}
                      {aiProcessingStep === 'done' && '✨ Analysis Complete!'}
                    </div>
                  </div>

                  <Progress value={progress} className="w-64 h-2 bg-white/10" />
                  <p className="text-sm text-gray-400">
                    {aiProcessingStep === 'uploading' && 'Preparing your resume for deep analysis...'}
                    {aiProcessingStep === 'extracting' && 'Scanning every line of your CV for skills and context...'}
                    {aiProcessingStep === 'sending' && 'Sending data to our AI engine — powered by Gemini...'}
                    {aiProcessingStep === 'analyzing' && 'Cross-referencing your profile with job requirements...'}
                    {aiProcessingStep === 'done' && 'Almost there! Finalizing your personalized report...'}
                  </p>
                </div>

                {/* Status Icons */}
                <div className="flex justify-center space-x-8 text-xs text-gray-500 mt-6">
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-5 h-5 mb-1" />
                    <span>Upload</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FileText className="w-5 h-5 mb-1" />
                    <span>Extract</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Server className="w-5 h-5 mb-1" />
                    <span>Gemini</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="w-5 h-5 mb-1" />
                    <span>Analyze</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-5 h-5 mb-1 text-yellow-400" />
                    <span>Done</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-medium">{error}</p>
                    <Button
                      onClick={analyzeMatch}
                      variant="outline"
                      size="sm"
                      className="mt-2 text-red-300 border-red-500/30 hover:bg-red-500/10"
                    >
                      <Zap className="w-4 h-4 mr-1" /> Retry Analysis
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Match Results Section */}
            {matchData && !loading && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="match-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Fit Score Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/15"
                    style={{
                      boxShadow:
                        '0 10px 30px -10px rgba(255, 255, 255, 0.08), 0 0 20px rgba(148, 163, 184, 0.05)',
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      {getScoreIcon(matchData.fitScore)}
                      <h3 className="text-2xl font-semibold text-white">Your Resume Match</h3>
                    </div>
                    <ScoreGauge score={matchData.fitScore} />
                    <Badge
                      className={`text-sm font-semibold px-6 py-3 mt-4 ${getScoreBadgeColor(
                        matchData.fitScore
                      )} rounded-full shadow-sm border border-white/20`}
                    >
                      {matchData.fitScore >= 80
                        ? 'Excellent Match 🚀'
                        : matchData.fitScore >= 60
                        ? 'Good Potential 💡'
                        : 'Needs Improvement ⚠️'}
                    </Badge>
                    <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                      {matchData.fitScore >= 80
                        ? 'Your resume strongly aligns with this role. You’re a top contender!'
                        : matchData.fitScore >= 60
                        ? 'Good alignment — minor tweaks could boost your chances significantly.'
                        : 'Significant gaps detected. Strategic revisions recommended.'}
                    </p>
                  </motion.div>

                  {/* Summary Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/15"
                  >
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-blue-300" />
                        <h4 className="font-semibold text-white">AI Match Summary</h4>
                      </div>
                      <motion.div
                        animate={{ rotate: isSummaryExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Info className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </div>
                    {isSummaryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-gray-300 leading-relaxed"
                      >
                        <p>{matchData.summary}</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Strengths Section */}
                  {matchData.strengths.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/15"
                    >
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsStrengthsExpanded(!isStrengthsExpanded)}>
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-green-300" />
                          <h4 className="font-semibold text-white">Key Strengths ({matchData.strengths.length})</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: isStrengthsExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </div>
                      {isStrengthsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="flex flex-wrap gap-2">
                            {matchData.strengths.map((s, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                              >
                                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-green-500/30 transition-colors">
                                  <CheckCircle className="w-4 h-4" /> {s}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Weaknesses Section */}
                  {matchData.weaknesses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/15"
                    >
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsWeaknessesExpanded(!isWeaknessesExpanded)}>
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-amber-300" />
                          <h4 className="font-semibold text-white">Areas to Improve ({matchData.weaknesses.length})</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: isWeaknessesExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </div>
                      {isWeaknessesExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="flex flex-wrap gap-2">
                            {matchData.weaknesses.map((w, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                              >
                                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-amber-500/30 transition-colors">
                                  <AlertCircle className="w-4 h-4" /> {w}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Recommendations Section */}
                  {matchData.recommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/15"
                    >
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsRecommendationsExpanded(!isRecommendationsExpanded)}>
                        <div className="flex items-center space-x-3">
                          <Lightbulb className="w-5 h-5 text-yellow-300" />
                          <h4 className="font-semibold text-white">Personalized Recommendations ({matchData.recommendations.length})</h4>
                        </div>
                        <motion.div
                          animate={{ rotate: isRecommendationsExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </div>
                      {isRecommendationsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-3"
                        >
                          {matchData.recommendations.map((rec, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.1 }}
                              className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                            >
                              <Lightbulb className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-200 text-sm leading-relaxed">{rec}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10"
                  >
                    <div className="flex-1 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const content = `
AI Resume Match Report
======================
Job: ${jobTitle} at ${companyName}
Fit Score: ${matchData.fitScore}%

Summary:
${matchData.summary}

Strengths:
${matchData.strengths.join('\n- ')}

Weaknesses:
${matchData.weaknesses.join('\n- ')}

Recommendations:
${matchData.recommendations.join('\n- ')}

Generated by DeepSeek AI
`;
                            await navigator.clipboard.writeText(content);
                            toast({ title: 'Copied', description: 'Full analysis copied to clipboard.' });
                          } catch {
                            toast({
                              title: 'Copy failed',
                              description: 'Could not copy output.',
                              variant: 'destructive',
                            });
                          }
                        }}
                        className="h-10 flex-1 border border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <Clipboard className="w-4 h-4 mr-2" /> Copy Full Report
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
                        className="h-10 flex-1 border border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <Download className="w-4 h-4 mr-2" /> Export as JSON
                      </Button>
                    </div>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      size="sm"
                      className="h-10 flex-1 border border-white/20 text-gray-300 hover:bg-white/10"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={analyzeMatch}
                      disabled={loading}
                      size="sm"
                      className="h-10 flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg border border-transparent"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="ml-1">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span className="ml-1">Re-analyze</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!matchData && !loading && !error && (
              <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <Brain className="w-16 h-16 mb-4 opacity-40" />
                <p className="text-lg">Waiting for AI to analyze your resume...</p>
                <p className="mt-2 text-sm">We're evaluating how well your profile matches this role.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIResumeMatching;