import { useState, useEffect } from 'react';

interface StreamingLogProps {
  text: string;
  speed?: number;
  onTextUpdate?: (isStillStreaming: boolean) => void;
}

export const StreamingLog = ({ text, speed = 30, onTextUpdate }: StreamingLogProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
        // Trigger scroll update on each character, pass true to indicate still streaming
        if (onTextUpdate) {
          onTextUpdate(true);
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      // Streaming completed
      if (onTextUpdate) {
        onTextUpdate(false);
      }
    }
  }, [currentIndex, text, speed, onTextUpdate]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="text-sm">{displayedText}</span>
  );
};

