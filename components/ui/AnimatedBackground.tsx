'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  variant?: 'noise' | 'grid' | 'gradient' | 'particles' | 'aurora';
  className?: string;
  opacity?: number;
}

export function AnimatedBackground({
  variant = 'noise',
  className = '',
  opacity = 0.5,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant !== 'noise' && variant !== 'particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    if (variant === 'noise') {
      // Film grain noise effect
      const renderNoise = () => {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 255;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = 15; // Low opacity
        }

        ctx.putImageData(imageData, 0, 0);
        animationId = requestAnimationFrame(renderNoise);
      };

      renderNoise();
    }

    if (variant === 'particles') {
      // Floating particles
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        opacity: number;
      }> = [];

      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }

      const renderParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(109, 100, 163, ${p.opacity})`;
          ctx.fill();
        });

        // Draw connections
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(109, 100, 163, ${0.1 * (1 - dist / 150)})`;
              ctx.stroke();
            }
          });
        });

        animationId = requestAnimationFrame(renderParticles);
      };

      renderParticles();
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [variant]);

  if (variant === 'noise' || variant === 'particles') {
    return (
      <canvas
        ref={canvasRef}
        className={cn('pointer-events-none fixed inset-0 z-0', className)}
        style={{ opacity }}
      />
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 z-0', className)}
        style={{
          opacity,
          backgroundImage: `
            linear-gradient(rgba(109, 100, 163, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109, 100, 163, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    );
  }

  if (variant === 'gradient') {
    return (
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-0 animate-gradient',
          className
        )}
        style={{
          opacity,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(109, 100, 163, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)
          `,
          backgroundSize: '200% 200%',
          animation: 'gradient 15s ease infinite',
        }}
      />
    );
  }

  if (variant === 'aurora') {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
        style={{ opacity }}
      >
        <div className="aurora-layer aurora-1" />
        <div className="aurora-layer aurora-2" />
        <div className="aurora-layer aurora-3" />
        <style jsx>{`
          .aurora-layer {
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            background: radial-gradient(
              ellipse at center,
              transparent 20%,
              rgba(109, 100, 163, 0.1) 50%,
              transparent 80%
            );
            animation: aurora-move 20s ease-in-out infinite;
          }
          .aurora-1 {
            animation-delay: 0s;
          }
          .aurora-2 {
            animation-delay: -7s;
            background: radial-gradient(
              ellipse at center,
              transparent 20%,
              rgba(6, 182, 212, 0.08) 50%,
              transparent 80%
            );
          }
          .aurora-3 {
            animation-delay: -14s;
            background: radial-gradient(
              ellipse at center,
              transparent 20%,
              rgba(245, 158, 11, 0.05) 50%,
              transparent 80%
            );
          }
          @keyframes aurora-move {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              transform: translate(10%, 10%) rotate(5deg) scale(1.1);
            }
            50% {
              transform: translate(-5%, 15%) rotate(-5deg) scale(0.9);
            }
            75% {
              transform: translate(-10%, -5%) rotate(3deg) scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

// Scanlines overlay
export function ScanlinesOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 2px,
          rgba(0, 0, 0, ${opacity}) 2px,
          rgba(0, 0, 0, ${opacity}) 4px
        )`,
      }}
    />
  );
}

// Vignette overlay
export function VignetteOverlay({ intensity = 0.4 }: { intensity?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        background: `radial-gradient(
          ellipse at center,
          transparent 40%,
          rgba(0, 0, 0, ${intensity}) 100%
        )`,
      }}
    />
  );
}
