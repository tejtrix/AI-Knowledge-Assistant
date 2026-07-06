import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface Citation {
  source: string;
  page: string;
  content: string;
  score: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, citations }) => {
  const isUser = role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full py-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex w-full max-w-4xl mx-auto gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isUser ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex-1 space-y-4 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block text-left rounded-2xl px-6 py-4 max-w-[85%] ${
            isUser ? 'bg-blue-600 text-white shadow-md rounded-tr-none' : 'bg-white border border-gray-200 shadow-sm rounded-tl-none text-gray-800'
          }`}>
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert" style={{ color: 'inherit' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Citations block for assistant */}
          {!isUser && citations && citations.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm mt-4 inline-block max-w-[85%]">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Sources Context
              </h4>
              <div className="space-y-2">
                {citations.map((cite, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span className="font-medium text-blue-600">{cite.source}</span>
                      <span>Page: {cite.page}</span>
                    </div>
                    <p className="text-gray-600 text-xs line-clamp-2">{cite.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
