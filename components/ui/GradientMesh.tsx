'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface GradientMeshProps {
  colors?: string[];
  speed?: number;
  blur?: number;
  className?: string;
}

// Animated gradient mesh background (igloo-style)
export function GradientMesh({
  colors = ['#6D64A3', '#06B6D4', '#8B7EC8', '#F59E0B'],
  speed = 20,
  blur = 100,
  className = '',
}: GradientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Animate each blob
    blobsRef.current.forEach((blob, i) => {
      if (!blob) return;

      // Random movement
      gsap.to(blob, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        duration: speed + i * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Scale breathing
      gsap.to(blob, {
        scale: `random(0.8, 1.2)`,
        duration: speed * 0.5 + i,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) blobsRef.current[i] = el;
          }}
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '40%',
            left: `${20 + (i % 2) * 40}%`,
            top: `${20 + Math.floor(i / 2) * 40}%`,
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            filter: `blur(${blur}px)`,
          }}
        />
      ))}
    </div>
  );
}

// Canvas-based gradient mesh (smoother)
export function CanvasGradientMesh({
  colors = ['#6D64A3', '#06B6D4', '#8B7EC8'],
  speed = 0.001,
  className = '',
}: {
  colors?: string[];
  speed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Blob positions
    const blobs = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 200 + Math.random() * 200,
      color,
    }));

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob) => {
        // Move blob
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges
        if (blob.x < 0 || blob.x > canvas.width) blob.vx *= -1;
        if (blob.y < 0 || blob.y > canvas.height) blob.vy *= -1;

        // Draw gradient blob
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color + '40');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ filter: 'blur(80px)' }}
    />
  );
}

// Noise texture overlay
export function NoiseOverlay({
  opacity = 0.03,
  className = '',
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Animated gradient border
export function GradientBorder({
  children,
  colors = ['#6D64A3', '#06B6D4', '#8B7EC8', '#F59E0B'],
  speed = 3,
  width = 2,
  className = '',
}: {
  children: React.ReactNode;
  colors?: string[];
  speed?: number;
  width?: number;
  className?: string;
}) {
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const border = borderRef.current;
    if (!border) return;

    gsap.to(border, {
      backgroundPosition: '200% 0',
      duration: speed,
      ease: 'none',
      repeat: -1,
    });
  }, [speed]);

  const gradientString = colors.join(', ') + ', ' + colors[0];

  return (
    <div className={`relative ${className}`}>
      <div
        ref={borderRef}
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(90deg, ${gradientString})`,
          backgroundSize: '200% 100%',
          padding: width,
        }}
      >
        <div className="h-full w-full rounded-[inherit] bg-bg-base" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

// Gradient text
export function GradientText({
  children,
  colors = ['#6D64A3', '#06B6D4'],
  animate = false,
  className = '',
}: {
  children: React.ReactNode;
  colors?: string[];
  animate?: boolean;
  className?: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animate || !textRef.current) return;

    gsap.to(textRef.current, {
      backgroundPosition: '200% 0',
      duration: 3,
      ease: 'none',
      repeat: -1,
    });
  }, [animate]);

  const gradientString = colors.join(', ') + (animate ? ', ' + colors[0] : '');

  return (
    <span
      ref={textRef}
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradientString})`,
        backgroundSize: animate ? '200% 100%' : '100% 100%',
      }}
    >
      {children}
    </span>
  );
}

// Orb / floating gradient sphere
export function FloatingOrb({
  color = '#6D64A3',
  size = 300,
  blur = 60,
  position = { x: 50, y: 50 },
  animate = true,
  className = '',
}: {
  color?: string;
  size?: number;
  blur?: number;
  position?: { x: number; y: number };
  animate?: boolean;
  className?: string;
}) {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !orbRef.current) return;

    gsap.to(orbRef.current, {
      x: 'random(-50, 50)',
      y: 'random(-50, 50)',
      scale: 'random(0.9, 1.1)',
      duration: 10,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, [animate]);

  return (
    <div
      ref={orbRef}
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color}50 0%, ${color}20 40%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

// Multiple floating orbs
export function FloatingOrbs({
  count = 3,
  colors = ['#6D64A3', '#06B6D4', '#8B7EC8'],
  className = '',
}: {
  count?: number;
  colors?: string[];
  className?: string;
}) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    color: colors[i % colors.length],
    size: 200 + Math.random() * 200,
    blur: 40 + Math.random() * 40,
    position: {
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    },
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
    </div>
  );
}
