import { useState, useEffect } from 'react';
import { parseMarkdown } from '../utils/markdown';

interface StreamingTextProps {
  text: string;
  speed?: number;
  stopStreaming?: boolean;
  onTextUpdate?: (isStillStreaming: boolean) => void;
}

export const StreamingText = ({ text, speed = 100, stopStreaming = false, onTextUpdate }: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (stopStreaming) {
      // Stop streaming and show full text immediately
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

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
  }, [currentIndex, text, speed, stopStreaming, onTextUpdate]);

  useEffect(() => {
    if (!stopStreaming) {
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [text, stopStreaming]);

  const htmlContent = parseMarkdown(displayedText);

  return (
    <div
      className="markdown-content text-sm md:text-base text-gray-200"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

