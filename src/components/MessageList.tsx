import { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Wyvate</h2>
            <p className="text-gray-400 mb-4">Your AI voice assistant for discovering nearby vendors</p>
            <div className="inline-flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-[#2a2a2a] text-gray-300 rounded-full text-sm border border-[#3a3a3a]">Find vendors</span>
              <span className="px-3 py-1 bg-[#2a2a2a] text-gray-300 rounded-full text-sm border border-[#3a3a3a]">Explore services</span>
              <span className="px-3 py-1 bg-[#2a2a2a] text-gray-300 rounded-full text-sm border border-[#3a3a3a]">Voice enabled</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="ai-message px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg">
              <div className="flex items-center gap-2 text-gray-300">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
