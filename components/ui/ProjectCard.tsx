'use client';

import { motion } from 'framer-motion';

interface ProjectCardProps {
    name: string;
    type: string;
    complexity: string;
    timeline: string;
    priceRange: string;
    description: string;
    icon?: string;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function ProjectCard({
    name,
    type,
    complexity,
    timeline,
    priceRange,
    description,
    icon = '📦',
    isSelected = false,
    onClick,
    className = '',
}: ProjectCardProps) {
    const complexityColors: Record<string, string> = {
        simple: 'text-green-400 bg-green-400/10 border-green-400/30',
        moderate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
        complex: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
        enterprise: 'text-red-400 bg-red-400/10 border-red-400/30',
    };

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group cursor-pointer ${className}`}
        >
            {/* Card */}
            <div
                className={`relative p-5 rounded-xl bg-bg-surface/80 backdrop-blur-sm 
                   border transition-all duration-300 overflow-hidden
                   ${isSelected
                        ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20'
                        : 'border-cyan-900/30 hover:border-cyan-400/30'
                    }`}
            >
                {/* Holographic border effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, 
                rgba(6, 182, 212, 0.1) 0%, 
                rgba(109, 100, 163, 0.1) 50%, 
                rgba(6, 182, 212, 0.1) 100%)`,
                        }}
                    />
                </div>

                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                    style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{icon}</span>
                            <div>
                                <h3 className="font-display font-bold text-text-primary group-hover:text-cyan-400 transition-colors">
                                    {name}
                                </h3>
                                <p className="font-mono text-xs text-text-muted uppercase tracking-wider">
                                    {type.replace('-', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Complexity Badge */}
                        <span className={`px-2 py-1 font-mono text-[10px] uppercase rounded border ${complexityColors[complexity] || complexityColors.simple}`}>
                            {complexity}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Timeline */}
                        <div className="space-y-1">
                            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                                Timeline
                            </p>
                            <p className="font-mono text-sm text-cyan-400 font-bold">
                                {timeline}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="space-y-1">
                            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                                Est. Cost
                            </p>
                            <p className="font-mono text-sm text-primary-light font-bold">
                                {priceRange}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-cyan-400 rounded-full 
                     flex items-center justify-center text-black"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                )}

                {/* Corner glow effect */}
                <div
                    className="absolute -top-10 -right-10 w-32 h-32 opacity-0 group-hover:opacity-50 
                   transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
                    }}
                />
            </div>
        </motion.div>
    );
}

// Smaller variant for feature selection
export function ProjectTypeCard({
    id,
    name,
    icon,
    description,
    isSelected,
    onClick,
}: {
    id: string;
    name: string;
    icon: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-lg text-left transition-all duration-300
                 border backdrop-blur-sm
                 ${isSelected
                    ? 'bg-cyan-400/10 border-cyan-400/50 shadow-lg shadow-cyan-400/10'
                    : 'bg-bg-surface/50 border-cyan-900/30 hover:border-cyan-400/30'
                }`}
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`font-display font-bold ${isSelected ? 'text-cyan-400' : 'text-text-primary'}`}>
                    {name}
                </span>
            </div>
            <p className="text-xs text-text-muted line-clamp-2">
                {description}
            </p>

            {/* Selection indicator */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full 
                   flex items-center justify-center text-black"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}
        </motion.button>
    );
}

export default ProjectCard;
