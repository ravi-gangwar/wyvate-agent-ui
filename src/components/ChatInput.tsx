import { Volume2, VolumeX, X } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { useVoiceContext } from '../App';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export const ChatInput = ({ onSend, isLoading, onCancel }: ChatInputProps) => {
  const { isMuted, toggleMute } = useVoiceContext();
  const { isSpeaking, stop } = useTextToSpeech();

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript && !isLoading && !isSpeaking) {
      onSend(transcript);
    }
  };

  const handleMuteToggle = () => {
    if (isSpeaking) {
      stop();
    }
    toggleMute();
  };

  const handleAbort = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const showAbortButton = isLoading || isSpeaking;

  return (
    <div className="w-full flex items-center justify-center gap-4">
      {!showAbortButton && <VoiceButton onTranscript={handleVoiceTranscript} />}
      
      {showAbortButton && (
        <button
          onClick={handleAbort}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ff3b30] hover:bg-[#ff2d20] transition-all duration-200"
          title={isLoading ? 'Cancel request' : 'Stop voice'}
        >
          <X className="text-white" size={20} />
        </button>
      )}
      
      <button
        onClick={handleMuteToggle}
        className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 ${
          isMuted
            ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
            : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
        }`}
        title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
      >
        {isMuted ? (
          <VolumeX className="text-gray-400" size={20} />
        ) : (
          <Volume2 className="text-[#ff9500]" size={20} />
        )}
      </button>
    </div>
  );
};
