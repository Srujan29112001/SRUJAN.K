'use client';

export function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden opacity-[0.03] mix-blend-overlay">
      <div
        className="absolute inset-[-200%] h-[400%] w-[400%] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      <style jsx global>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-5%, -10%); }
          40% { transform: translate(7%, -15%); }
          60% { transform: translate(-10%, 5%); }
          80% { transform: translate(5%, 10%); }
        }
        .animate-grain {
          animation: grain 15s steps(6) infinite; /* OPTIMIZED: Slower animation, fewer steps */
        }
      `}</style>
    </div>
  );
}
