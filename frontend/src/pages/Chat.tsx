import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatApp from '@/components/ChatApp';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                AI Chat Assistant
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chat with our AI assistant powered by DeepSeek. Get help with job search, 
              career advice, resume tips, and more!
            </p>
          </div>

          {/* Welcome Message */}
          {userData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Welcome!
              </h2>
              <p className="text-blue-700">
                Ask me anything about your job search, career development, or get help with 
                resume writing. I'm here to assist you!
              </p>
            </div>
          )}

          {/* Chat Component */}
          <ChatApp />

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Career Guidance</h3>
              <p className="text-gray-600 text-sm">
                Get personalized career advice and job search strategies
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Resume Help</h3>
              <p className="text-gray-600 text-sm">
                Improve your resume with AI-powered suggestions and tips
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Interview Prep</h3>
              <p className="text-gray-600 text-sm">
                Practice common interview questions and get feedback
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
