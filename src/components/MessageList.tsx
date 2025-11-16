import { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { SocketLogEvent } from '../types/socket';
import { StreamingLog } from './StreamingLog';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  logs?: SocketLogEvent[];
}

export const MessageList = ({ messages, isLoading, logs = [] }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = false) => {
    if (containerRef.current) {
      if (smooth) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, isLoading, logs.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24 scroll-smooth">
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
            <div className="ai-message px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg max-w-[80%]">
              {logs.length > 0 ? (
                <div className="flex items-start gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff9500] mt-2 flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1">
                    <StreamingLog text={logs[logs.length - 1].message} speed={20} />
                    {logs[logs.length - 1].metadata?.resultCount && (
                      <p className="text-xs text-gray-400 mt-1">
                        Found {logs[logs.length - 1].metadata.resultCount} results
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse"></div>
                  <span className="text-sm">Processing your request...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
