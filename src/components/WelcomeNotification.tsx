import { useState } from 'react';
import { Sparkles, Star, X } from 'lucide-react';

const WelcomeNotification = () => {
  const [showNotification, setShowNotification] = useState(true);
  const [notificationClicked, setNotificationClicked] = useState(false);

  const handleNotificationClick = () => {
    setNotificationClicked(true);
    // Reset after 3 seconds
    setTimeout(() => {
      setNotificationClicked(false);
    }, 3000);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4 shadow-lg transition-all duration-500 cursor-pointer ${
        notificationClicked ? 'animate-notification-click' : 'animate-slide-down'
      }`}
      onClick={handleNotificationClick}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${notificationClicked ? 'animate-spin' : 'animate-bounce'}`}>
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {notificationClicked ? '🎉 Welcome to SmartHire! 🎉' : 'Thank you for visiting SmartHire!'}
            </span>
            <div className="flex space-x-1">
              <div className={`w-2 h-2 bg-yellow-300 rounded-full ${notificationClicked ? 'animate-ping' : 'animate-pulse'}`}></div>
              <div className={`w-2 h-2 bg-yellow-300 rounded-full ${notificationClicked ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '0.2s' }}></div>
              <div className={`w-2 h-2 bg-yellow-300 rounded-full ${notificationClicked ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs opacity-90">
            {notificationClicked ? '🚀 Start your journey today!' : 'Discover amazing opportunities'}
          </span>
          <div className={`${notificationClicked ? 'animate-bounce' : 'animate-spin'}`}>
            <Star className="h-4 w-4 text-yellow-300" />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCloseNotification();
            }}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeNotification; 