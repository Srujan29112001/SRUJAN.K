'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Menu } from 'lucide-react';

const navItems = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'chat', label: 'AI Chat', href: '#chat' },
    { id: 'calculator', label: 'Calculator', href: '#calculator' },
    { id: 'booking', label: 'Booking', href: '#booking' },
];

export function AINavigation() {
    const [activeSection, setActiveSection] = useState('hero');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Detect active section
            const sections = navItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(navItems[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.getElementById(href.slice(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            // Close mobile menu after navigation
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-black/80 backdrop-blur-lg border-b border-white/10'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Back to Portfolio */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-xs uppercase tracking-wider">
                            Portfolio
                        </span>
                    </Link>

                    {/* Desktop Navigation Items */}
                    <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-lg">
                        {navItems.map((item, index) => (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 ${activeSection === item.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-cyan-400/60 mr-1">0{index + 1}</span>
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/30 transition-all duration-300"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-xl">
                    <div className="px-4 py-3 space-y-2">
                        {navItems.map((item, index) => (
                            <a
                                key={item.id}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`block px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 ${activeSection === item.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <span className="text-cyan-400/60 mr-2">0{index + 1}</span>
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default AINavigation;

