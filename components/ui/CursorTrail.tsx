'use client';

import { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const mousePos = useRef({ x: 0, y: 0 });
  const trail = useRef<TrailPoint[]>([]);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      trail.current.push({ x: e.clientX, y: e.clientY, age: 0 });

      // Limit trail length
      if (trail.current.length > 50) {
        trail.current.shift();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail
      trail.current = trail.current.filter((point) => {
        point.age += 1;
        return point.age < 30;
      });

      if (trail.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail.current[0].x, trail.current[0].y);

        for (let i = 1; i < trail.current.length; i++) {
          const point = trail.current[i];
          const prevPoint = trail.current[i - 1];

          // Smooth curve
          const midX = (prevPoint.x + point.x) / 2;
          const midY = (prevPoint.y + point.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
        }

        // Gradient stroke
        const gradient = ctx.createLinearGradient(
          trail.current[0].x,
          trail.current[0].y,
          trail.current[trail.current.length - 1].x,
          trail.current[trail.current.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(109, 100, 163, 0)');
        gradient.addColorStop(0.5, 'rgba(109, 100, 163, 0.3)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.5)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Draw glow at cursor position
      const glow = ctx.createRadialGradient(
        mousePos.current.x,
        mousePos.current.y,
        0,
        mousePos.current.x,
        mousePos.current.y,
        30
      );
      glow.addColorStop(0, 'rgba(109, 100, 163, 0.2)');
      glow.addColorStop(1, 'rgba(109, 100, 163, 0)');

      ctx.beginPath();
      ctx.arc(mousePos.current.x, mousePos.current.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// Simpler dot trail version
export function DotTrail() {
  const [dots, setDots] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const idRef = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      idRef.current += 1;
      setDots((prev) => [
        ...prev.slice(-15),
        { x: e.clientX, y: e.clientY, id: idRef.current },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      {dots.map((dot, i) => (
        <div
          key={dot.id}
          className="absolute h-2 w-2 rounded-full bg-primary"
          style={{
            left: dot.x - 4,
            top: dot.y - 4,
            opacity: (i + 1) / dots.length * 0.5,
            transform: `scale(${(i + 1) / dots.length})`,
            transition: 'opacity 0.3s, transform 0.3s',
          }}
        />
      ))}
    </div>
  );
}
