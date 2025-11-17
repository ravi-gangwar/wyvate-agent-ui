import { SocketLogEvent } from '../types/socket';
import { StreamingLog } from './StreamingLog';
import { ChatMessage } from './ChatMessage';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoiceContext } from '../App';
import { useEffect, useRef, useCallback } from 'react';
import { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  logs?: SocketLogEvent[];
  stopStreaming: boolean;
  setStopVoiceRef: (stopFn: () => void) => void;
  onSendMessage?: (message: string) => void;
}

export const MessageList = ({ messages, isLoading, logs = [], stopStreaming, setStopVoiceRef, onSendMessage }: MessageListProps) => {
  const { speak, stop } = useTextToSpeech();
  const { isMuted } = useVoiceContext();
  const lastMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const userScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const isStreamingRef = useRef(false);

  const scrollToBottom = useCallback((smooth = false, force = false) => {
    if (messagesEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 200;
      
      // Only force scroll if actively streaming and user hasn't scrolled up
      if (force && isStreamingRef.current && !userScrolledUpRef.current) {
        // Use direct scrollTop manipulation for more reliable scrolling during streaming
        container.scrollTop = container.scrollHeight;
      } else if (!userScrolledUpRef.current && (isNearBottom || !smooth)) {
        // Normal scroll for new messages
        if (!smooth) {
          container.scrollTop = container.scrollHeight;
        } else {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        // Reset scroll flag if we successfully scrolled to bottom
        if (isNearBottom) {
          userScrolledUpRef.current = false;
        }
      }
    }
  }, []);

  useEffect(() => {
    scrollContainerRef.current = document.getElementById('message-scroll-container');
    const container = scrollContainerRef.current;
    
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      // Detect if user scrolled up manually
      if (scrollTop < lastScrollTopRef.current) {
        // User scrolled up - disable auto-scroll
        userScrolledUpRef.current = true;
      } else if (isNearBottom) {
        // User scrolled back to bottom - re-enable auto-scroll only if streaming
        if (isStreamingRef.current) {
          userScrolledUpRef.current = false;
        }
      }
      
      lastScrollTopRef.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Track streaming state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isStreaming = !isLoading && lastMessage?.type === 'ai' && lastMessage?.markdown_text && !stopStreaming;
    isStreamingRef.current = Boolean(isStreaming);
    
    // Reset scroll flag when streaming starts
    if (isStreaming) {
      userScrolledUpRef.current = false;
    }
  }, [messages, isLoading, stopStreaming]);

  useEffect(() => {
    // Auto-scroll when new messages arrive (only if not streaming or user hasn't scrolled up)
    const lastMessage = messages[messages.length - 1];
    const isStreaming = !isLoading && lastMessage?.type === 'ai' && lastMessage?.markdown_text && !stopStreaming;
    
    // Only auto-scroll for new messages if not currently streaming (streaming has its own handler)
    if (!isStreaming && !userScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages.length, isLoading, logs.length, scrollToBottom, messages, stopStreaming]);

  // Continuous scroll during text streaming - only if user hasn't scrolled up
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isStreaming = !isLoading && lastMessage?.type === 'ai' && lastMessage?.markdown_text && !stopStreaming;
    
    if (isStreaming && !userScrolledUpRef.current) {
      // More frequent scrolling during streaming
      const interval = setInterval(() => {
        scrollToBottom(false, true); // Force scroll during streaming
      }, 50); // Check every 50ms for smoother following

      return () => clearInterval(interval);
    }
  }, [messages, isLoading, stopStreaming, scrollToBottom]);

  // Use MutationObserver to detect DOM changes during streaming
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      // Check if we're streaming and user hasn't scrolled up
      const lastMessage = messages[messages.length - 1];
      const isStreaming = !isLoading && lastMessage?.type === 'ai' && lastMessage?.markdown_text && !stopStreaming;
      
      if (isStreaming && !userScrolledUpRef.current && isStreamingRef.current) {
        // Immediately scroll on content change during streaming
        scrollToBottom(false, true);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false,
    });

    return () => observer.disconnect();
  }, [messages, isLoading, stopStreaming, scrollToBottom]);

  // Auto-play voice for new AI messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'ai' && lastMessage?.ai_voice && !isLoading && !isMuted && lastMessage.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMessage.id;
      speak(lastMessage.ai_voice);
    }
  }, [messages, isLoading, isMuted, speak]);

  // Update stop voice ref whenever stop function changes
  useEffect(() => {
    setStopVoiceRef(() => stop);
  }, [stop, setStopVoiceRef]);

  const hasContent = messages.length > 0 || isLoading;

  // Get the last message to check if it's streaming
  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = lastMessage?.type === 'ai' && lastMessage?.markdown_text && !stopStreaming && !isLoading;

  return (
    <div ref={containerRef} className={`w-full max-w-3xl mx-auto flex flex-col space-y-4 ${!hasContent ? 'min-h-full justify-center' : 'py-4'}`}>
      {!hasContent && (
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Wyvate</h2>
          <p className="text-gray-400 mb-6">Your AI voice assistant for discovering nearby vendors</p>
          
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-4 hover:border-[#ff9500] transition-colors">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#ff9500]">•</span> Explore Nearby Vendors
              </h3>
              <p className="text-gray-400 text-sm mb-3">Ask me to find vendors near you</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSendMessage?.("Show me restaurants nearby")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "Show me restaurants nearby"
                </button>
                <button
                  onClick={() => onSendMessage?.("Find coffee shops in my area")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "Find coffee shops in my area"
                </button>
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-4 hover:border-[#ff9500] transition-colors">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#ff9500]">•</span> Explore Services Provided by Vendors
              </h3>
              <p className="text-gray-400 text-sm mb-3">Discover what services vendors offer</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSendMessage?.("What services does this vendor provide?")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "What services does this vendor provide?"
                </button>
                <button
                  onClick={() => onSendMessage?.("Show me menu items")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "Show me menu items"
                </button>
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-4 hover:border-[#ff9500] transition-colors">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#ff9500]">•</span> Add to Cart and Order
              </h3>
              <p className="text-gray-400 text-sm mb-3">Add items to your cart and place orders</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSendMessage?.("Add this item to cart")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "Add this item to cart"
                </button>
                <button
                  onClick={() => onSendMessage?.("I want to order this")}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#ff9500] text-gray-300 hover:text-white rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  "I want to order this"
                </button>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-6">Click the microphone button below to start asking questions</p>
        </div>
      )}

      {messages.map((message, index) => {
        // For the last AI message, check if it should show streaming
        const isLastMessage = index === messages.length - 1;
        const shouldStream = Boolean(isLastMessage && isLastMessageStreaming && message.type === 'ai');
        
        return (
          <ChatMessage 
            key={message.id} 
            message={message}
            isStreaming={shouldStream}
            stopStreaming={stopStreaming}
            onTextUpdate={(isStillStreaming) => {
              // Update streaming state
              isStreamingRef.current = isStillStreaming;
              // Only auto-scroll if actively streaming and user hasn't scrolled up
              if (isStillStreaming && !userScrolledUpRef.current) {
                scrollToBottom(false, true); // Force scroll on each character update
              }
            }}
          />
        );
      })}

      {isLoading && logs.length > 0 && (
        <div className="flex justify-center animate-slideIn">
          <div className="ai-message px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg max-w-[80%]">
            <div className="flex items-start gap-2 text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff9500] mt-2 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1">
                <StreamingLog 
                  text={logs[logs.length - 1].message} 
                  speed={20} 
                  onTextUpdate={(isStillStreaming) => {
                    // Update streaming state
                    isStreamingRef.current = isStillStreaming;
                    // Only auto-scroll if actively streaming and user hasn't scrolled up
                    if (isStillStreaming && !userScrolledUpRef.current) {
                      scrollToBottom(false, true); // Force scroll on each character update
                    }
                  }} 
                />
                {logs[logs.length - 1]?.metadata?.resultCount && (
                  <p className="text-xs text-gray-400 mt-1">
                    Found {logs[logs.length - 1]?.metadata?.resultCount} results
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && logs.length === 0 && (
        <div className="flex justify-center animate-slideIn">
          <div className="ai-message px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg max-w-[80%]">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse"></div>
              <span className="text-sm">Processing your request...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
