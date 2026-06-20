'use client';

import { type ReactNode } from 'react';

/**
 * SectionHeading — the canonical section title used across the portfolio,
 * matching the Projects ("PROJECT ARCHIVES") treatment: a mono `( EYEBROW )`
 * kicker on a hairline rule, a huge bold uppercase display title, and an
 * optional subtitle. Left-aligned, one consistent look for every section.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  accent = '#22d3ee',
  meta,
  titleId,
  className = '',
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  accent?: string;
  meta?: ReactNode;
  titleId?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <span
          className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] whitespace-nowrap"
          style={{ color: accent }}
        >
          ( {eyebrow} )
        </span>
        <span className="h-px flex-grow bg-white/10" />
        {meta && (
          <span className="font-mono text-[11px] sm:text-xs text-white/30 whitespace-nowrap tabular-nums">
            {meta}
          </span>
        )}
      </div>
      <h2
        id={titleId}
        className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-white tracking-[-0.03em] leading-[0.9]"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}

export default SectionHeading;
