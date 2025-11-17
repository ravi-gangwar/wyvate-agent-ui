import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useEffect } from 'react';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export const VoiceButton = ({ onTranscript }: VoiceButtonProps) => {
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
        isListening
          ? 'bg-white shadow-lg scale-105'
          : 'bg-white hover:bg-gray-100 hover:scale-105'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <div className="flex items-center justify-center gap-1.5">
          <div className="sound-wave-bar-large w-1.5 bg-[#ff9500] rounded-full"></div>
          <div className="sound-wave-bar-large w-1.5 bg-[#ff9500] rounded-full"></div>
          <div className="sound-wave-bar-large w-1.5 bg-[#ff9500] rounded-full"></div>
          <div className="sound-wave-bar-large w-1.5 bg-[#ff9500] rounded-full"></div>
          <div className="sound-wave-bar-large w-1.5 bg-[#ff9500] rounded-full"></div>
        </div>
      ) : (
        <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
};
