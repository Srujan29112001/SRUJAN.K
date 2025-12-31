'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ComplexitySliderProps {
    value: string;
    onChange: (value: string) => void;
    levels: Array<{
        id: string;
        name: string;
        description: string;
    }>;
    className?: string;
}

export function ComplexitySlider({
    value,
    onChange,
    levels,
    className = '',
}: ComplexitySliderProps) {
    const [isHovered, setIsHovered] = useState(false);
    const currentIndex = levels.findIndex(l => l.id === value);
    const currentLevel = levels[currentIndex] || levels[0];

    const percentage = (currentIndex / (levels.length - 1)) * 100;

    return (
        <div
            className={`space-y-4 ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Label */}
            <div className="flex justify-between items-center">
                <span className="font-mono text-sm text-text-secondary">Complexity Level</span>
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-sm font-bold text-cyan-400"
                >
                    {currentLevel.name}
                </motion.span>
            </div>

            {/* Slider Track */}
            <div className="relative">
                {/* Background track */}
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden border border-cyan-900/30">
                    {/* Filled portion */}
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #06b6d4, #6D64A3, #f59e0b)',
                        }}
                        initial={false}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>

                {/* Level markers */}
                <div className="absolute inset-0 flex justify-between items-center px-0">
                    {levels.map((level, i) => {
                        const isActive = i <= currentIndex;
                        const isCurrent = level.id === value;

                        return (
                            <button
                                key={level.id}
                                onClick={() => onChange(level.id)}
                                className="relative z-10 group"
                            >
                                {/* Marker dot */}
                                <motion.div
                                    className={`w-4 h-4 rounded-full border-2 transition-colors ${isCurrent
                                            ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50'
                                            : isActive
                                                ? 'bg-primary border-primary'
                                                : 'bg-bg-surface border-cyan-900/50'
                                        }`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                />

                                {/* Tooltip on hover */}
                                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                              opacity-0 group-hover:opacity-100 transition-opacity
                              pointer-events-none z-20`}>
                                    <div className="bg-bg-elevated border border-cyan-900/30 rounded px-2 py-1 
                                shadow-lg whitespace-nowrap">
                                        <p className="font-mono text-xs text-cyan-400 font-bold">{level.name}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Hidden range input for accessibility */}
                <input
                    type="range"
                    min={0}
                    max={levels.length - 1}
                    value={currentIndex}
                    onChange={(e) => onChange(levels[parseInt(e.target.value)].id)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
            </div>

            {/* Level labels */}
            <div className="flex justify-between">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => onChange(level.id)}
                        className={`font-mono text-[10px] transition-colors ${level.id === value
                                ? 'text-cyan-400'
                                : 'text-text-muted hover:text-text-secondary'
                            }`}
                    >
                        {level.name}
                    </button>
                ))}
            </div>

            {/* Description */}
            <motion.p
                key={value}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="font-mono text-xs text-text-muted"
            >
                {currentLevel.description}
            </motion.p>

            {/* Glow effect when hovered */}
            {isHovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                    }}
                />
            )}
        </div>
    );
}

export default ComplexitySlider;
