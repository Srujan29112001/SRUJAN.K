'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

// Animated brain/neural network icon
export function NeuralIcon({
  size = 48,
  color = 'currentColor',
  animated = true,
  className = '',
}: {
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animated) return;

    const svg = svgRef.current;
    if (!svg) return;

    const nodes = svg.querySelectorAll('.node');
    const connections = svg.querySelectorAll('.connection');

    // Pulse animation for nodes
    gsap.to(nodes, {
      scale: 1.2,
      opacity: 0.8,
      duration: 0.8,
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Draw animation for connections
    connections.forEach((connection) => {
      const length = (connection as SVGPathElement).getTotalLength();
      gsap.set(connection, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
      gsap.to(connection, {
        strokeDashoffset: 0,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });
    });
  }, [animated]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Connections */}
      <path
        className="connection"
        d="M12 24 L24 12 L36 24 L24 36 Z"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        className="connection"
        d="M24 12 L24 36"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path
        className="connection"
        d="M12 24 L36 24"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Nodes */}
      <circle className="node" cx="24" cy="12" r="4" fill={color} />
      <circle className="node" cx="12" cy="24" r="4" fill={color} />
      <circle className="node" cx="36" cy="24" r="4" fill={color} />
      <circle className="node" cx="24" cy="36" r="4" fill={color} />
      <circle className="node" cx="24" cy="24" r="5" fill={color} />
    </svg>
  );
}

// Animated code brackets icon
export function CodeIcon({
  size = 48,
  color = 'currentColor',
  animated = true,
  className = '',
}: {
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animated) return;

    const svg = svgRef.current;
    if (!svg) return;

    const leftBracket = svg.querySelector('.left-bracket');
    const rightBracket = svg.querySelector('.right-bracket');
    const cursor = svg.querySelector('.cursor');

    // Bracket animation
    gsap.fromTo(
      leftBracket,
      { x: 5 },
      { x: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'power1.inOut' }
    );

    gsap.fromTo(
      rightBracket,
      { x: -5 },
      { x: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'power1.inOut' }
    );

    // Cursor blink
    gsap.to(cursor, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'steps(1)',
    });
  }, [animated]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        className="left-bracket"
        d="M16 12 L8 24 L16 36"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        className="right-bracket"
        d="M32 12 L40 24 L32 36"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect className="cursor" x="22" y="16" width="4" height="16" fill={color} />
    </svg>
  );
}

// Animated robot/AI icon
export function RobotIcon({
  size = 48,
  color = 'currentColor',
  animated = true,
  className = '',
}: {
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animated) return;

    const svg = svgRef.current;
    if (!svg) return;

    const eyes = svg.querySelectorAll('.eye');
    const antenna = svg.querySelector('.antenna');
    const glow = svg.querySelector('.glow');

    // Eye glow animation
    gsap.to(eyes, {
      filter: 'drop-shadow(0 0 4px currentColor)',
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Antenna pulse
    gsap.to(antenna, {
      scale: 1.2,
      transformOrigin: 'center bottom',
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Glow animation
    if (glow) {
      gsap.to(glow, {
        opacity: 0.3,
        scale: 1.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [animated]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Glow effect */}
      <circle className="glow" cx="24" cy="24" r="20" fill={color} opacity="0.1" />

      {/* Antenna */}
      <circle className="antenna" cx="24" cy="8" r="3" fill={color} />
      <line x1="24" y1="11" x2="24" y2="16" stroke={color} strokeWidth="2" />

      {/* Head */}
      <rect x="12" y="16" width="24" height="20" rx="4" stroke={color} strokeWidth="2" fill="none" />

      {/* Eyes */}
      <circle className="eye" cx="18" cy="26" r="3" fill={color} />
      <circle className="eye" cx="30" cy="26" r="3" fill={color} />

      {/* Mouth */}
      <line x1="18" y1="32" x2="30" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Ears */}
      <rect x="8" y="22" width="4" height="8" rx="2" fill={color} />
      <rect x="36" y="22" width="4" height="8" rx="2" fill={color} />

      {/* Body indicator */}
      <rect x="20" y="38" width="8" height="4" rx="1" fill={color} />
    </svg>
  );
}

// Animated circuit pattern
export function CircuitPattern({
  width = 200,
  height = 200,
  color = 'currentColor',
  animated = true,
  className = '',
}: {
  width?: number;
  height?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animated) return;

    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll('.circuit-path');
    const nodes = svg.querySelectorAll('.circuit-node');

    // Animate paths
    paths.forEach((path, i) => {
      const length = (path as SVGPathElement).getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2 + i * 0.5,
        repeat: -1,
        ease: 'none',
      });
    });

    // Pulse nodes
    gsap.to(nodes, {
      scale: 1.5,
      opacity: 0.5,
      duration: 0.8,
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [animated]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      {/* Horizontal paths */}
      <path className="circuit-path" d="M0 50 H80 V100 H120 V50 H200" stroke={color} strokeWidth="1" opacity="0.5" />
      <path className="circuit-path" d="M0 100 H40 V150 H160 V100 H200" stroke={color} strokeWidth="1" opacity="0.5" />
      <path className="circuit-path" d="M0 150 H100 V170 H200" stroke={color} strokeWidth="1" opacity="0.5" />

      {/* Vertical paths */}
      <path className="circuit-path" d="M50 0 V50 H80 V200" stroke={color} strokeWidth="1" opacity="0.5" />
      <path className="circuit-path" d="M150 0 V80 H120 V200" stroke={color} strokeWidth="1" opacity="0.5" />

      {/* Nodes */}
      <circle className="circuit-node" cx="80" cy="50" r="4" fill={color} />
      <circle className="circuit-node" cx="120" cy="100" r="4" fill={color} />
      <circle className="circuit-node" cx="40" cy="150" r="4" fill={color} />
      <circle className="circuit-node" cx="160" cy="150" r="4" fill={color} />
      <circle className="circuit-node" cx="100" cy="170" r="4" fill={color} />
      <circle className="circuit-node" cx="50" cy="50" r="3" fill={color} />
      <circle className="circuit-node" cx="150" cy="80" r="3" fill={color} />
    </svg>
  );
}

// Animated loading spinner with tech style
export function TechSpinner({
  size = 48,
  color = 'currentColor',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const outer = svg.querySelector('.outer-ring');
    const inner = svg.querySelector('.inner-ring');
    const core = svg.querySelector('.core');

    gsap.to(outer, {
      rotation: 360,
      transformOrigin: 'center center',
      duration: 3,
      repeat: -1,
      ease: 'none',
    });

    gsap.to(inner, {
      rotation: -360,
      transformOrigin: 'center center',
      duration: 2,
      repeat: -1,
      ease: 'none',
    });

    gsap.to(core, {
      scale: 1.2,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Outer ring */}
      <g className="outer-ring">
        <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="1" opacity="0.3" fill="none" />
        <path
          d="M24 2 A22 22 0 0 1 46 24"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Inner ring */}
      <g className="inner-ring">
        <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1" opacity="0.3" fill="none" />
        <path
          d="M24 10 A14 14 0 0 1 38 24 A14 14 0 0 1 24 38"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Core */}
      <circle className="core" cx="24" cy="24" r="4" fill={color} />
    </svg>
  );
}

// Animated hexagon grid
export function HexGrid({
  width = 200,
  height = 200,
  color = 'currentColor',
  animated = true,
  className = '',
}: {
  width?: number;
  height?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animated) return;

    const svg = svgRef.current;
    if (!svg) return;

    const hexagons = svg.querySelectorAll('.hex');

    gsap.set(hexagons, { opacity: 0.1 });

    hexagons.forEach((hex, i) => {
      gsap.to(hex, {
        opacity: 0.6,
        duration: 0.5,
        delay: i * 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 1,
        ease: 'sine.inOut',
      });
    });
  }, [animated]);

  // Generate hexagon points
  const hexPath = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return `M${points.join(' L')} Z`;
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      className={className}
    >
      {/* Grid of hexagons */}
      <path className="hex" d={hexPath(50, 40, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(100, 40, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(150, 40, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(75, 80, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(125, 80, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(50, 120, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(100, 120, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(150, 120, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(75, 160, 25)} stroke={color} strokeWidth="1" fill="none" />
      <path className="hex" d={hexPath(125, 160, 25)} stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}

// Animated arrow with glitch effect
export function GlitchArrow({
  size = 48,
  color = 'currentColor',
  direction = 'right',
  className = '',
}: {
  size?: number;
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 100 + Math.random() * 150);
      }
    }, 1000);

    return () => clearInterval(glitchInterval);
  }, []);

  const rotation = {
    up: -90,
    down: 90,
    left: 180,
    right: 0,
  }[direction];

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Base arrow */}
      <path
        d="M8 24 H36 M28 16 L36 24 L28 32"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Glitch layers */}
      {glitching && (
        <>
          <path
            d="M8 24 H36 M28 16 L36 24 L28 32"
            stroke="#06B6D4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ transform: 'translateX(-2px)' }}
          />
          <path
            d="M8 24 H36 M28 16 L36 24 L28 32"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ transform: 'translateX(2px)' }}
          />
        </>
      )}
    </svg>
  );
}

// Draw on scroll SVG
export function DrawSVG({
  children,
  className = '',
  duration = 2,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const paths = container.querySelectorAll('path, line, polyline, polygon, circle, rect');

    paths.forEach((path) => {
      const svgPath = path as SVGGeometryElement;
      if (svgPath.getTotalLength) {
        const length = svgPath.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          duration,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });
  }, [duration, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
