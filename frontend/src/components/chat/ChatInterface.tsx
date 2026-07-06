import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { streamChatResponse } from '../../services/chat.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

interface ChatInterfaceProps {
  sessionId: string | null;
  onSessionCreated: (id: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onSessionCreated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let currentResponse = '';
    let currentCitations: any[] = [];

    try {
      await streamChatResponse(
        userMsg,
        sessionId,
        (chunk) => {
          currentResponse += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { 
              role: 'assistant', 
              content: currentResponse, 
              citations: currentCitations 
            };
            return newMsgs;
          });
        },
        (citations) => {
          currentCitations = citations;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { 
              role: 'assistant', 
              content: currentResponse, 
              citations: currentCitations 
            };
            return newMsgs;
          });
        },
        (metadata) => {
          if (metadata.session_id && !sessionId) {
            onSessionCreated(metadata.session_id);
          }
        }
      );
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { 
          role: 'assistant', 
          content: currentResponse + '\n\n**Error:** Failed to complete response.' 
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <svg className="w-16 h-16 text-emerald-600/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">How can I help you today?</p>
            <p className="text-sm">Ask me questions about your uploaded documents.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} citations={msg.citations} />
          ))
        )}
        
        {isLoading && (
          <div className="flex w-full justify-start py-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end gap-2">
          <div className="relative w-full">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question about your documents..."
              className="w-full resize-none rounded-xl border border-gray-300 py-3 pl-4 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-h-48 overflow-y-auto min-h-[56px] shadow-sm"
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="mb-1 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3">
          AI Knowledge Assistant can make mistakes. Check important info.
        </p>
      </div>

    </div>
  );
};
