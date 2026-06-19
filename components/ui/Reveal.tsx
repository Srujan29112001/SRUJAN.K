'use client';

import { motion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Reveal — lightweight scroll-into-view animation primitive used across the
 * site (fade + slide / "pop up from the ground"). Framer-motion only, no GSAP
 * pin, so it's cheap. `once` so it doesn't re-fire on every scroll pass.
 */
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 48 },
  right: { x: -48 },
  none: {},
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  amount = 0.2,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  amount?: number;
  as?: 'div' | 'span' | 'section' | 'li';
}) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offset[direction] },
    show: { opacity: 1, x: 0, y: 0 },
  };
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export default Reveal;
