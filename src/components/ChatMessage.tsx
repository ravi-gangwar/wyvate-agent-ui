import { Message } from '../types/chat';
import { StreamingText } from './StreamingText';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  stopStreaming?: boolean;
  onTextUpdate?: (isStillStreaming: boolean) => void;
}

export const ChatMessage = ({ message, isStreaming = false, stopStreaming = false, onTextUpdate }: ChatMessageProps) => {
  if (message.type === 'user') {
    return (
      <div className="flex justify-center mb-4 animate-slideIn">
        <div className="user-message max-w-[80%] px-6 py-4 rounded-2xl bg-gradient-to-br from-[#ff9500] to-[#ff8500] text-white shadow-lg">
          <p className="text-base md:text-lg">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-4 animate-slideIn">
      <div className="ai-message max-w-[80%] px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg">
        {message.markdown_text && (
          <StreamingText 
            text={message.markdown_text} 
            speed={20} 
            stopStreaming={stopStreaming || !isStreaming}
            onTextUpdate={onTextUpdate}
          />
        )}
      </div>
    </div>
  );
};
