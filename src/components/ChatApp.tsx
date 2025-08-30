import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, Key, Sparkles, Plus, Loader2, X, MessageSquare, Briefcase, Users, Code, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// Smart questions about SmartHire
const smartQuestions = [
  {
    category: "Platform Overview",
    question: "What is SmartHire and how does it work?",
    preview: "Learn about SmartHire's core features and functionality",
    icon: Briefcase
  },
  {
    category: "AI Features",
    question: "How does the AI matching system work in SmartHire?",
    preview: "Understand the intelligent job-candidate matching technology",
    icon: Sparkles
  },
  {
    category: "User Benefits", 
    question: "What are the key benefits of using SmartHire?",
    preview: "Discover how SmartHire enhances your job search experience",
    icon: Users
  },
  {
    category: "Technical Details",
    question: "What technologies power SmartHire?",
    preview: "Explore the tech stack behind the platform",
    icon: Code
  },
  {
    category: "DeepSeek Integration",
    question: "How is DeepSeek AI integrated into SmartHire?",
    preview: "Learn about the AI-powered chat and analysis features",
    icon: Zap
  },
  {
    category: "Getting Started",
    question: "How do I get started with SmartHire?",
    preview: "Step-by-step guide to begin your journey",
    icon: MessageSquare
  }
];

// Project knowledge base
const projectKnowledge = {
  "What is SmartHire and how does it work?": `SmartHire is an intelligent job matching platform that revolutionizes how candidates and employers connect:

🎯 **Core Features**:
- AI-powered resume analysis and job matching
- Intelligent candidate screening for companies
- Real-time chat assistance with DeepSeek AI
- Advanced profile management for both users and companies
- Seamless application tracking and management

🚀 **How It Works**:
1. **Upload & Analyze**: Upload your resume for AI-powered analysis
2. **Smart Matching**: Get matched with relevant jobs based on skills and experience
3. **Apply Seamlessly**: One-click applications with enhanced profiles
4. **Track Progress**: Monitor application status in real-time
5. **Get Assistance**: Chat with AI for career guidance and support`,

  "How does the AI matching system work in SmartHire?": `SmartHire's AI matching system uses advanced algorithms to create perfect job-candidate connections:

🤖 **AI Technology**:
- DeepSeek-powered resume analysis
- Natural language processing for job descriptions
- Machine learning algorithms for compatibility scoring
- Semantic understanding of skills and requirements

📊 **Matching Process**:
- Extracts key skills, experience, and qualifications from resumes
- Analyzes job requirements and company preferences
- Calculates compatibility scores with detailed explanations
- Provides personalized recommendations for both sides
- Continuously learns from successful matches to improve accuracy`,

  "What are the key benefits of using SmartHire?": `SmartHire offers comprehensive benefits for modern job seekers and employers:

💼 **For Job Seekers**:
- Smart job recommendations based on your profile
- AI-powered resume optimization suggestions
- Real-time application tracking
- Career guidance and interview preparation
- Personalized skill development recommendations

🏢 **For Employers**:
- Intelligent candidate screening and ranking
- Detailed compatibility reports with explanations
- Streamlined hiring workflow
- Advanced search and filtering capabilities
- Analytics and insights on hiring performance

🔍 **Job Search Support**:
- Job matching explanations
- Application tracking help
- Company research assistance
- Salary negotiation tips

⚡ **24/7 Availability**: Always ready to help with instant, intelligent responses`,

  "What technologies power SmartHire?": `SmartHire is built with cutting-edge technologies for optimal performance and scalability:

🛠️ **Frontend Stack**:
- React 18 with TypeScript for type-safe development
- Vite for lightning-fast development and builds
- Tailwind CSS for modern, responsive styling
- Shadcn/ui for beautiful, accessible components

⚙️ **Backend Infrastructure**:
- Node.js with Express.js for robust API development
- MongoDB for flexible, scalable data storage
- JWT authentication for secure user sessions
- Cloudinary for efficient file storage and management

🤖 **AI & Machine Learning**:
- DeepSeek API integration for advanced language understanding
- Custom AI scoring algorithms for job matching
- PDF processing for resume text extraction
- Natural language processing for content analysis

🔧 **Development Tools**:
- ESLint and Prettier for code quality
- PostCSS for advanced CSS processing
- Git for version control and collaboration`,

  "How is DeepSeek AI integrated into SmartHire?": `SmartHire leverages DeepSeek's powerful AI capabilities throughout the platform:

🧠 **AI Chat Assistant**:
- Real-time career guidance and job search support
- Intelligent responses to user queries about the platform
- Personalized advice based on user profiles and goals
- 24/7 availability for instant assistance

🔍 **Resume Analysis**:
- Advanced text extraction and analysis from uploaded resumes
- Skill identification and categorization
- Experience level assessment
- Improvement suggestions and optimization recommendations

🎯 **Job Matching Intelligence**:
- Sophisticated compatibility scoring between candidates and jobs
- Detailed explanations of match reasoning
- Personalized job recommendations
- Dynamic ranking based on multiple factors

💡 **Smart Features**:
- Contextual help and guidance throughout the platform
- Intelligent form completion assistance
- Automated content generation for profiles
- Predictive text and suggestions for better user experience`,

  "How do I get started with SmartHire?": `Getting started with SmartHire is simple and straightforward:

📝 **Step 1: Create Your Account**
- Sign up with email or social login
- Choose your role (Job Seeker or Employer)
- Complete email verification

👤 **Step 2: Build Your Profile**
- Upload your resume for AI analysis
- Complete your profile with additional details
- Add skills, experience, and preferences
- Set your job search criteria

🔍 **Step 3: Explore Opportunities**
- Browse AI-recommended jobs
- Use advanced search and filters
- Review compatibility scores and explanations
- Save interesting positions for later

📤 **Step 4: Apply & Track**
- Submit applications with one click
- Track application status in real-time
- Receive updates and feedback
- Schedule interviews through the platform

💬 **Step 5: Get AI Assistance**
- Chat with our AI assistant for guidance
- Get resume optimization tips
- Receive interview preparation help
- Access career development resources

🚀 **Pro Tips**: 
- Keep your profile updated for better matches
- Use the AI chat for personalized advice
- Set up job alerts for new opportunities
- Engage with the community features`
};

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your SmartHire AI assistant powered by DeepSeek. I have comprehensive knowledge about the SmartHire platform and can help you with:

• Job search strategies and career guidance
• Resume optimization and analysis  
• Interview preparation and tips
• Understanding SmartHire's AI features
• Technical questions about the platform

Feel free to ask me anything or use the quick questions below! 🚀`,
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSmartQuestions, setShowSmartQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSmartQuestion = (questionData: typeof smartQuestions[0]) => {
    // Add user question
    const userMessage: Message = {
      id: Date.now().toString(),
      content: questionData.question,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Get predefined answer
    const answer = projectKnowledge[questionData.question as keyof typeof projectKnowledge];
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: answer || "I'd be happy to help with that! Let me provide you with detailed information about SmartHire.",
      role: 'assistant',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setShowSmartQuestions(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          apiKey: apiKey || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          role: 'assistant',
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${data.error}`,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">SmartHire AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Powered by DeepSeek • Always ready to help</p>
            </div>
          </div>
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">Custom API Key (Optional)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Leave blank to use default API key
                  </p>
                </div>
                <Button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Smart Questions Section */}
            {showSmartQuestions && messages.length <= 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mx-auto max-w-4xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Smart Questions about SmartHire
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartQuestions.map((q, index) => {
                    const IconComponent = q.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSmartQuestion(q)}
                        className="group flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 
                          dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 
                          dark:border-gray-600 hover:from-blue-100 hover:to-indigo-100 
                          dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 
                          hover:shadow-md hover:scale-[1.02] text-left"
                      >
                        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg 
                          group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                          <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 
                            group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {q.category}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {q.preview}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 
                          dark:group-hover:text-blue-300 flex-shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowSmartQuestions(false)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Hide smart questions
                </button>
              </div>
            )}

            {/* Smart Questions Toggle Button - Show when hidden */}
            {!showSmartQuestions && (
              <div className="mx-auto max-w-4xl">
                <button
                  onClick={() => setShowSmartQuestions(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 
                    text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 
                    dark:hover:bg-blue-800 transition-colors border border-blue-200 
                    dark:border-blue-700 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Show Smart Questions
                </button>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 max-w-4xl mx-auto ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  </div>
                  <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 order-2 shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3 max-w-4xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about SmartHire or your career..."
                className="min-h-[52px] max-h-[120px] resize-none border-gray-300 dark:border-gray-600 
                  focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 
                  dark:focus:ring-blue-400 rounded-xl shadow-sm pr-12 bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              {inputMessage.length > 0 && (
                <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                  Press Enter to send
                </div>
              )}
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-[52px] w-[52px] rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 
                hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 
                shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Powered by DeepSeek
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
