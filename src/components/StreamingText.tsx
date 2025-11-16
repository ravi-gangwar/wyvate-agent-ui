import { useState, useEffect } from 'react';
import { parseMarkdown } from '../utils/markdown';

interface StreamingTextProps {
  text: string;
  speed?: number;
}

export const StreamingText = ({ text, speed = 30 }: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  const htmlContent = parseMarkdown(displayedText);

  return (
    <div
      className="markdown-content text-sm md:text-base text-gray-200"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

