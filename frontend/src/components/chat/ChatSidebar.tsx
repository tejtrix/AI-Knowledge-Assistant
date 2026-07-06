import React, { useEffect, useState } from 'react';
import { getChatSessions } from '../../services/chat.service';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentSessionId, onSelectSession }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentSessionId]); // Refetch when session changes (e.g., new one created)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0 hidden md:flex">
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={() => onSelectSession(null)}
          className="w-full flex items-center gap-2 justify-center py-2 px-4 border border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-sm text-gray-500 mt-4">No past conversations.</p>
        ) : (
          <div className="space-y-1">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-colors ${
                  currentSessionId === session.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm font-medium truncate">{session.title}</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(session.updated_at), 'MMM d, h:mm a')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
