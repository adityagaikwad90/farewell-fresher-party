import React, { useEffect, useRef } from 'react';

export default function BackgroundEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle, elegant particle system matching the event theme
    const particleCount = 32;
    const particles = [];
    const colors = ['#7C3AED', '#06B6D4', '#F472B6', '#FBBF24', '#A78BFA', '#CBD5E1'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // gentle slow upward float
        alpha: Math.random() * 0.4 + 0.15,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        angle: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = Math.max(0.08, p.alpha + Math.sin(p.angle) * 0.15);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070A13]">
      {/* Subtle modern dot-grid texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Atmospheric radial gradient blobs */}
      {/* Top Center-Left: Energetic Violet / Purple glow */}
      <div
        className="absolute -top-[10%] left-[15%] w-[55vw] h-[45vw] max-w-[800px] max-h-[600px] rounded-full filter blur-[100px] opacity-70 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, rgba(91, 33, 182, 0.05) 50%, transparent 70%)',
        }}
      />

      {/* Top Right: Energetic Pink / Fuchsia glow */}
      <div
        className="absolute top-[5%] -right-[5%] w-[45vw] h-[40vw] max-w-[650px] max-h-[550px] rounded-full filter blur-[95px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, rgba(192, 38, 211, 0.04) 50%, transparent 70%)',
        }}
      />

      {/* Mid Left: Freshers Cyan glow */}
      <div
        className="absolute top-[40%] -left-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full filter blur-[110px] opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, transparent 65%)',
        }}
      />

      {/* Bottom Right: Farewell Warm Gold / Amber glow */}
      <div
        className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full filter blur-[110px] opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 65%)',
        }}
      />

      {/* Floating subtle particle canvas */}
      <canvas ref={canvasRef} className="w-full h-full relative z-10" />
    </div>
  );
}
