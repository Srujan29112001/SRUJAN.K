'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComplexitySlider } from '@/components/ui/ComplexitySlider';
import { ProjectCard, ProjectTypeCard } from '@/components/ui/ProjectCard';
import {
    projectTypes,
    complexityLevels,
    features,
    exampleProjects,
    calculateEstimate,
    formatPrice,
    getApplicableFeatures,
} from '@/data/project-estimates';

gsap.registerPlugin(ScrollTrigger);

// Currency data with exchange rates (approximate rates as of 2024)
const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 92.5 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.5 },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.72 },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
];

export interface ProjectCalculatorHandle {
    scrollToCalculator: () => void;
}

interface ProjectCalculatorProps {
    className?: string;
}

export const ProjectCalculator = forwardRef<ProjectCalculatorHandle, ProjectCalculatorProps>(
    function ProjectCalculator({ className = '' }, ref) {
        const [selectedType, setSelectedType] = useState(projectTypes[0].id);
        const [selectedComplexity, setSelectedComplexity] = useState(complexityLevels[0].id);
        const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
        const [showResults, setShowResults] = useState(false);
        const [selectedCurrency, setSelectedCurrency] = useState('USD');
        const sectionRef = useRef<HTMLDivElement>(null);
        const resultsRef = useRef<HTMLDivElement>(null);

        // Get current currency data
        const currentCurrency = currencies.find(c => c.code === selectedCurrency) || currencies[0];

        // Format price in selected currency
        const formatInCurrency = (amount: number) => {
            const converted = Math.round(amount * currentCurrency.rate);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currentCurrency.code,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(converted);
        };

        // Expose scroll method to parent
        useImperativeHandle(ref, () => ({
            scrollToCalculator: () => {
                sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
        }));

        // Calculate estimate whenever inputs change
        const estimate = calculateEstimate(selectedType, selectedComplexity, selectedFeatures);

        useEffect(() => {
            // Show results after first interaction
            if (selectedType || selectedComplexity || selectedFeatures.length > 0) {
                setShowResults(true);
            }
        }, [selectedType, selectedComplexity, selectedFeatures]);

        useEffect(() => {
            // Register ScrollTrigger but don't use GSAP animations that can get stuck
            // All animations are now handled by Framer Motion
        }, []);

        const toggleFeature = (featureId: string) => {
            setSelectedFeatures(prev =>
                prev.includes(featureId)
                    ? prev.filter(f => f !== featureId)
                    : [...prev, featureId]
            );
        };

        // Clear selected features when project type or complexity changes
        useEffect(() => {
            setSelectedFeatures([]);
        }, [selectedType, selectedComplexity]);

        const selectedTypeData = projectTypes.find(p => p.id === selectedType);
        const selectedComplexityData = complexityLevels.find(c => c.id === selectedComplexity);

        // Get features applicable to selected project type and complexity
        const applicableFeatures = getApplicableFeatures(selectedType, selectedComplexity);

        // Calculate scaled prices for features based on complexity
        const getScaledFeature = (feature: typeof applicableFeatures[0]) => {
            const multiplier = selectedComplexityData?.multiplier || 1;
            const priceScale = 1 + (multiplier - 1) * 0.6; // 60% of multiplier for features
            const timeScale = 1 + (multiplier - 1) * 0.4; // 40% of multiplier for time
            return {
                ...feature,
                scaledPriceMin: Math.round(feature.priceAdd.min * priceScale),
                scaledPriceMax: Math.round(feature.priceAdd.max * priceScale),
                scaledWeeks: Math.round(feature.weeksAdd * timeScale * 10) / 10,
            };
        };

        return (
            <section
                ref={sectionRef}
                id="calculator"
                className={`relative py-20 px-4 overflow-hidden ${className}`}
                style={{ background: 'linear-gradient(180deg, #0f0a1a 0%, #0a0a0f 100%)' }}
            >
                {/* Background */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '100px 100px',
                    }}
                />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 calc-section"
                    >
                        {/* Section badge - boxed style */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="inline-block mb-8"
                        >
                            <span className="px-4 py-2 border border-cyan-400/50 rounded font-mono text-xs text-cyan-400 uppercase tracking-[0.3em]">
                                Project Calculator
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="relative font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight"
                            style={{
                                textShadow: '0 0 80px rgba(6, 182, 212, 0.5), 0 0 120px rgba(6, 182, 212, 0.3), 0 0 160px rgba(6, 182, 212, 0.2)'
                            }}
                        >
                            Estimate Your Project
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base md:text-lg text-white/60 max-w-2xl mx-auto"
                        >
                            Get an instant estimate for your project based on type, complexity, and features.
                        </motion.p>
                    </motion.div>

                    {/* Currency Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center mb-12"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface/50 border border-cyan-900/30 backdrop-blur-sm">
                            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">Currency:</span>
                            <div className="flex flex-wrap gap-2">
                                {currencies.map(currency => (
                                    <button
                                        key={currency.code}
                                        onClick={() => setSelectedCurrency(currency.code)}
                                        className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all
                                            ${selectedCurrency === currency.code
                                                ? 'bg-primary text-black font-bold'
                                                : 'bg-bg-elevated/50 text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                                            }`}
                                        title={currency.name}
                                    >
                                        {currency.symbol} {currency.code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>


                    {/* Calculator Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Inputs */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Project Type Selection */}
                            <div className="calc-section space-y-4">
                                <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                                    <span className="text-cyan-400">01</span>
                                    Select Project Type
                                </h3>
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {projectTypes.map(type => (
                                        <ProjectTypeCard
                                            key={type.id}
                                            id={type.id}
                                            name={type.name}
                                            icon={type.icon}
                                            description={type.description}
                                            isSelected={selectedType === type.id}
                                            onClick={() => setSelectedType(type.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Complexity Level */}
                            <div className="calc-section space-y-4">
                                <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                                    <span className="text-cyan-400">02</span>
                                    Complexity Level
                                </h3>
                                <div className="p-6 rounded-xl bg-bg-surface/50 border border-cyan-900/30">
                                    <ComplexitySlider
                                        value={selectedComplexity}
                                        onChange={setSelectedComplexity}
                                        levels={complexityLevels}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Results */}
                        <div className="lg:col-span-1">
                            <div
                                ref={resultsRef}
                                className="sticky top-24 space-y-6 calc-section"
                            >
                                {/* Estimate Card */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${selectedType}-${selectedComplexity}-${selectedFeatures.join(',')}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-bg-surface to-bg-elevated
                             border border-cyan-400/30 shadow-lg shadow-cyan-400/10"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{selectedTypeData?.icon}</span>
                                                <div>
                                                    <p className="font-display font-bold text-text-primary">
                                                        {selectedTypeData?.name}
                                                    </p>
                                                    <p className="font-mono text-xs text-text-muted uppercase">
                                                        {selectedComplexity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-xs text-text-muted">Complexity</p>
                                                <p className="font-display text-2xl font-bold text-cyan-400">
                                                    {estimate.complexityScore}/10
                                                </p>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent my-6" />

                                        {/* Timeline */}
                                        <div className="mb-6">
                                            <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                                                Estimated Timeline
                                            </p>
                                            <p className="font-display text-3xl font-bold text-text-primary">
                                                {estimate.weeksMin}-{estimate.weeksMax} <span className="text-lg text-text-secondary">weeks</span>
                                            </p>
                                        </div>

                                        {/* Cost */}
                                        <div className="mb-6">
                                            <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                                                Estimated Cost ({currentCurrency.code})
                                            </p>
                                            <p className="font-display text-3xl font-bold text-primary-light">
                                                {formatInCurrency(estimate.priceMin)} - {formatInCurrency(estimate.priceMax)}
                                            </p>
                                        </div>

                                        {/* Complexity Bar */}
                                        <div className="mb-6">
                                            <div className="flex justify-between mb-2">
                                                <p className="font-mono text-xs text-text-muted">Complexity Score</p>
                                                <p className="font-mono text-xs text-cyan-400">{estimate.complexityScore}/10</p>
                                            </div>
                                            <div className="h-2 bg-bg-base rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        background: `linear-gradient(90deg, #10B981, #F59E0B, #EF4444)`,
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${estimate.complexityScore * 10}%` }}
                                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Selected Features */}
                                        {selectedFeatures.length > 0 && (
                                            <div className="mb-6">
                                                <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
                                                    Included Features
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedFeatures.map(id => {
                                                        const feature = features.find(f => f.id === id);
                                                        return feature ? (
                                                            <span
                                                                key={id}
                                                                className="px-2 py-1 font-mono text-xs bg-primary/20 
                                         text-primary-light rounded border border-primary/30"
                                                            >
                                                                {feature.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <button
                                            onClick={() => {
                                                const bookingSection = document.getElementById('booking');
                                                bookingSection?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="w-full py-3 px-4 font-display font-bold text-black 
                               bg-gradient-to-r from-cyan-400 to-primary rounded-lg
                               hover:from-cyan-300 hover:to-primary-light transition-all
                               shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
                                        >
                                            Get Detailed Quote
                                        </button>

                                        <p className="mt-3 font-mono text-[10px] sm:text-xs text-text-muted text-center">
                                            * Estimates are approximate. Book a call for accurate pricing.
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Disclaimer */}
                                <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                                    <p className="font-mono text-xs text-yellow-400/80">
                                        💡 These are rough estimates. Final pricing depends on specific requirements,
                                        existing codebase, and other factors discussed during consultation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features - Full Width Section */}
                    <div className="calc-section space-y-4 mt-12">
                        <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                            <span className="text-cyan-400">03</span>
                            Additional Features
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {applicableFeatures.length > 0 ? (
                                applicableFeatures.map(feature => {
                                    const scaled = getScaledFeature(feature);
                                    return (
                                        <button
                                            key={feature.id}
                                            onClick={() => toggleFeature(feature.id)}
                                            className={`p-4 rounded-lg text-left transition-all duration-300
                               border backdrop-blur-sm
                               ${selectedFeatures.includes(feature.id)
                                                    ? 'bg-primary/20 border-primary/50'
                                                    : 'bg-bg-surface/50 border-cyan-900/30 hover:border-primary/30'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-display font-bold text-sm ${selectedFeatures.includes(feature.id) ? 'text-primary-light' : 'text-text-primary'
                                                    }`}>
                                                    {feature.name}
                                                </span>
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                       ${selectedFeatures.includes(feature.id)
                                                        ? 'bg-primary border-primary'
                                                        : 'border-text-muted'
                                                    }`}
                                                >
                                                    {selectedFeatures.includes(feature.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-muted line-clamp-2">{feature.description}</p>
                                            <p className="mt-2 font-mono text-xs text-primary-light">
                                                +{formatInCurrency(scaled.scaledPriceMin)}-{formatInCurrency(scaled.scaledPriceMax)} • +{scaled.scaledWeeks > 0 ? scaled.scaledWeeks : '<1'} weeks
                                            </p>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="col-span-full text-center text-text-muted py-8">
                                    Select a project type to see available features
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Example Projects */}
                    <div className="mt-20 calc-section">
                        <h3 className="font-display text-2xl font-bold text-text-primary mb-8 text-center">
                            Example Projects for Reference
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exampleProjects.slice(0, 6).map((project, i) => (
                                <ProjectCard
                                    key={i}
                                    name={project.name}
                                    type={project.type}
                                    complexity={project.complexity}
                                    timeline={project.timeline}
                                    priceRange={project.priceRange}
                                    description={project.description}
                                    icon={projectTypes.find(t => t.id === project.type)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
);

export default ProjectCalculator;
