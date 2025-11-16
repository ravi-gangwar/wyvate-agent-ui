import { useState, FormEvent, KeyboardEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { useVoiceContext } from '../App';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const { isMuted, toggleMute } = useVoiceContext();
  const { isSpeaking, stop } = useTextToSpeech();
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript && !isLoading) {
      onSend(transcript);
    }
  };

  const handleMuteToggle = () => {
    if (isSpeaking) {
      stop();
    }
    toggleMute();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-4 px-4 bg-[#1a1a1a] border-t border-[#2a2a2a] z-10">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you want to know?"
              disabled={isLoading}
              className="w-full pl-4 pr-28 py-4 rounded-2xl bg-[#2a2a2a] text-white placeholder-gray-400 border border-[#3a3a3a] focus:outline-none focus:border-[#ff9500] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            />
            
            <div className="absolute right-4 flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                  isMuted
                    ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                    : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                }`}
                title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
              >
                {isMuted ? (
                  <VolumeX className="text-gray-400" size={18} />
                ) : (
                  <Volume2 className="text-[#ff9500]" size={18} />
                )}
              </button>
              <VoiceButton onTranscript={handleVoiceTranscript} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
