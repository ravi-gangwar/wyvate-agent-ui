import { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useVoiceContext } from '../App';
import { StreamingText } from './StreamingText';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { speak } = useTextToSpeech();
  const { isMuted } = useVoiceContext();
  const hasAutoPlayedRef = useRef(false);

  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [message.id]);

  useEffect(() => {
    if (message.type === 'ai' && message.ai_voice && !isMuted && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      speak(message.ai_voice);
    }
  }, [message.id, message.ai_voice, isMuted, speak]);

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-slideIn">
        <div className="user-message max-w-[80%] px-4 py-3 rounded-2xl bg-gradient-to-br from-[#ff9500] to-[#ff8500] text-white shadow-lg">
          <p className="text-sm md:text-base">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 animate-slideIn">
      <div className="ai-message max-w-[80%] px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg">
        {message.markdown_text && (
          <StreamingText text={message.markdown_text} speed={20} />
        )}
      </div>
    </div>
  );
};
