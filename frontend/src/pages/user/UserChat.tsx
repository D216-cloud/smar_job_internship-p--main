import React from 'react';
import ChatApp from '@/components/ChatApp';

const UserChat: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden">
      {/* Full-screen Chat Experience */}
      <ChatApp />
    </div>
  );
};

export default UserChat;
