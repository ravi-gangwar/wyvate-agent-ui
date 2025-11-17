import { useEffect, useState } from 'react';

interface VoiceWaveformProps {
  isSpeaking: boolean;
}

export const VoiceWaveform = ({ isSpeaking }: VoiceWaveformProps) => {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!isSpeaking) {
      setHeights([]);
      return;
    }

    // Initialize heights
    const initialHeights = Array.from({ length: 40 }, () => Math.random() * 40 + 20);
    setHeights(initialHeights);

    // Update heights periodically for dynamic effect
    const interval = setInterval(() => {
      setHeights((prev) => prev.map(() => Math.random() * 50 + 15));
    }, 150);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  if (!isSpeaking) return null;

  return (
    <div className="fixed bottom-[20vh] left-0 right-0 h-32 pointer-events-none z-10 flex items-center justify-center opacity-80">
      <div className="flex items-center justify-center gap-0.5 px-4">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="voice-wave-bar w-1 bg-gradient-to-t from-[#ff9500] via-[#ff8500] to-[#ff7500] rounded-full transition-all duration-150"
            style={{
              animationDelay: `${i * 0.05}s`,
              height: heights[i] ? `${heights[i]}px` : '20px',
            }}
          />
        ))}
      </div>
    </div>
  );
};

