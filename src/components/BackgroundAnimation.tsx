import { useEffect, useRef } from 'react';

interface BackgroundAnimationProps {
  isSpeaking: boolean;
}

export const BackgroundAnimation = ({ isSpeaking }: BackgroundAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animated particles
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw animated gradient background
      const time = Date.now() * 0.0005;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 100,
        canvas.height / 2 + Math.cos(time) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      
      if (isSpeaking) {
        // More vibrant when speaking
        gradient.addColorStop(0, 'rgba(9, 194, 126, 0.15)');
        gradient.addColorStop(0.3, 'rgba(42, 42, 42, 0.4)');
        gradient.addColorStop(0.6, 'rgba(26, 26, 26, 0.6)');
        gradient.addColorStop(1, 'rgba(26, 26, 26, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(42, 42, 42, 0.3)');
        gradient.addColorStop(0.5, 'rgba(26, 26, 26, 0.6)');
        gradient.addColorStop(1, 'rgba(26, 26, 26, 0.9)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(9, 194, 126, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw pulsing circles when speaking
      if (isSpeaking) {
        const time = Date.now() * 0.001;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < 4; i++) {
          const radius = 150 + Math.sin(time * 0.8 + i * 0.5) * 80;
          const opacity = 0.15 - (i * 0.035);
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          const circleGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius);
          circleGradient.addColorStop(0, `rgba(9, 194, 126, ${opacity * 2})`);
          circleGradient.addColorStop(1, `rgba(9, 194, 126, 0)`);
          ctx.fillStyle = circleGradient;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isSpeaking]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%, #0a0a0a 100%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      {/* Additional gradient overlay for AI feel */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: isSpeaking 
            ? 'radial-gradient(circle at 50% 50%, rgba(9, 194, 126, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(9, 194, 126, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

