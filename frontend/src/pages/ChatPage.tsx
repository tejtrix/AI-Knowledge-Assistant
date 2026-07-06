import React, { useState } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { motion } from 'framer-motion';

export const ChatPage = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-64px)] overflow-hidden"
    >
      <ChatSidebar 
        currentSessionId={currentSessionId} 
        onSelectSession={setCurrentSessionId} 
      />
      <div className="flex-1 overflow-hidden p-4 md:p-6 bg-gray-100">
        <ChatInterface 
          sessionId={currentSessionId} 
          onSessionCreated={setCurrentSessionId} 
        />
      </div>
    </motion.div>
  );
};
