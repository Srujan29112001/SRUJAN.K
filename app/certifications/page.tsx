'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink } from 'lucide-react';

// Certificate Card Component with Magnetic Tilt
function CertificateCard({ cert }: { cert: { title: string; image: string; link: string } }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current || isMobile) return; // Disable tilt on mobile

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10; // Tilt up/down
    const rotateYValue = ((x - centerX) / centerX) * 10;  // Tilt left/right

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <a
      ref={cardRef}
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] transition-all duration-300"
      style={{
        transform: isMobile
          ? 'none'
          : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${rotateX !== 0 || rotateY !== 0 ? 'scale(1.02)' : 'scale(1)'}`,
        transition: isMobile
          ? 'border-color 0.3s, box-shadow 0.3s'
          : 'transform 0.1s ease-out, border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Certificate Image */}
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-blue-900/10 via-bg-surface to-purple-900/10">
        <Image
          src={cert.image}
          alt={cert.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="font-display text-xs sm:text-sm md:text-base font-semibold text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 sm:mb-3">
          {cert.title}
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-blue-400/60 font-mono">
          <span>View Certificate</span>
          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}

const certifications = [
  // AI & Machine Learning
  {
    category: 'AI & Machine Learning',
    items: [
      {
        title: 'Artificial Intelligence',
        image: '/images/certifications/AI.png',
        link: 'https://drive.google.com/file/d/17dc_cd4Hvm1ACTfkU0VzbM-9IHBhmd2k/view?usp=sharing'
      },
      {
        title: '2025 Bootcamp: Generative AI, LLM Apps, AI Agents, Cursor AI',
        image: '/images/certifications/bootcamp.jpg',
        link: '#'
      },
      {
        title: 'Modern Computer Vision',
        image: '/images/certifications/computer vision.jpg',
        link: 'https://drive.google.com/file/d/1_SpAOTD2mU9YNKFiGtkKIF6YdgGs-YZj/view?usp=sharing'
      },
      {
        title: 'TensorFlow',
        image: '/images/certifications/tensorflow.png',
        link: 'https://drive.google.com/file/d/172ohQe8Fe9jTYLu-u5redCzZM8NY6xtU/view?usp=sharing'
      },
      {
        title: 'PyTorch',
        image: '/images/certifications/pytorch.png',
        link: 'https://drive.google.com/file/d/1R1Bu7XZ1AbR1xP1gNgSLFhlutFpPbj5H/view?usp=sharing'
      },
      {
        title: 'MLops',
        image: '/images/certifications/mlops.png',
        link: '#'
      },
      {
        title: 'Prompt Engineering for AI',
        image: '/images/certifications/Prompt Engineer.jpg',
        link: 'https://drive.google.com/file/d/1lJwe904M6UZYBfptsMwOvGr0WsPBUuzB/view?usp=sharing'
      },
      {
        title: 'Intro to AI Agents',
        image: '/images/certifications/AI Agents.png',
        link: 'https://drive.google.com/file/d/1HBQla_Amc2pVPjsz3utDljtaT28IziE0/view?usp=sharing'
      }
    ]
  },
  // NVIDIA & Cloud
  {
    category: 'NVIDIA & Cloud Computing',
    items: [
      {
        title: 'AI App Boost with NVIDIA RAPIDS',
        image: '/images/certifications/Nvidia Rapids.jpg',
        link: 'https://drive.google.com/file/d/1RcJUL5vQBuAMAsj7JDl8KqxfHTG89BoL/view?usp=sharing'
      },
      {
        title: 'Disaster Risk Monitoring (NVIDIA)',
        image: '/images/certifications/disaster management.png',
        link: 'https://drive.google.com/file/d/1vWMNqgwWaA6SYa1Je1Y_IwbufqJYTMCM/view?usp=sharing'
      },
      {
        title: 'Develop, Customize, and Publish in Omniverse with Extensions',
        image: '/images/certifications/cloud .png',
        link: 'https://drive.google.com/file/d/1ZOKLaLpfdsCqG2ofdKa6VeLeNFL4s4my/view?usp=sharing'
      },
      {
        title: 'Introduction to Cloud Computing',
        image: '/images/certifications/cloud .png',
        link: 'https://drive.google.com/file/d/1Q3aX09mKlwJWN60l34-s1L7ZRGxbmUDw/view?usp=sharing'
      }
    ]
  },
  // Programming
  {
    category: 'Programming Languages',
    items: [
      {
        title: 'Python Programming',
        image: '/images/certifications/python.jpg',
        link: 'https://drive.google.com/file/d/1oV5Wvv7CxR7fs9VV0nSCZqLSoxXO7Snt/view?usp=sharing'
      },
      {
        title: 'CUDA Programming in C++',
        image: '/images/certifications/cuda-cpp.png',
        link: 'https://drive.google.com/file/d/1OZJ_xwMQDzbhgVB-oETKNWM2U6gq5CDK/view?usp=sharing'
      },
      {
        title: 'VLSI SoC Design using Verilog HDL',
        image: '/images/certifications/vlsi.png',
        link: 'https://drive.google.com/file/d/1vBZjzzJuvGVkUe2FvJgRRSfF8SP1rULl/view?usp=sharing'
      }
    ]
  },
  // Robotics & Control
  {
    category: 'Robotics & Control Systems',
    items: [
      {
        title: 'ROS 2',
        image: '/images/certifications/ROS2.jpg',
        link: 'https://drive.google.com/file/d/1qMpHzMRwd00XImP-0SGhBgyBbTyTSQir/view?usp=sharing'
      },
      {
        title: 'Applied Control Systems',
        image: '/images/certifications/control systems.jpg',
        link: 'https://drive.google.com/file/d/1Rl-b4YfgV2Q9IN0BMGSRbABgLHHOHZQu/view?usp=sharing'
      },
      {
        title: 'Mastering Microcontroller',
        image: '/images/certifications/microcontroller.jpg',
        link: 'https://drive.google.com/file/d/1VYNqJWznrRNDrZUUzHzXfcfF79BuswIj/view?usp=sharing'
      },
      {
        title: 'Jetson Nano Boot Camp',
        image: '/images/certifications/jetson-nano.png',
        link: 'https://drive.google.com/file/d/10u7xdOQWPzZBzs0OLft8jLNL2nSeFS5P/view?usp=sharing'
      },
      {
        title: 'Flight Dynamics with Tensors',
        image: '/images/certifications/Flight Dynamics.png',
        link: 'https://drive.google.com/file/d/1FTJXOi0ikE2HcUeVzDiW2m1dgrNprRqc/view?usp=sharing'
      },
      {
        title: 'Model, Simulate and Control a Drone in MATLAB & SIMULINK',
        image: '/images/certifications/Drone.png',
        link: 'https://drive.google.com/file/d/1B2oHuKczk4xWSeD2Ptd7P1uhJuASIjh9/view?usp=sharing'
      },
      {
        title: 'Design and Simulate the Aerodynamics of Propellers in MATLAB',
        image: '/images/certifications/propeller.jpeg',
        link: 'https://drive.google.com/file/d/1ecvQk09tNclDVsOTHQ3tHWiOBevGn62F/view?usp=sharing'
      }
    ]
  },
  // Specialized
  {
    category: 'Specialized Domains',
    items: [
      {
        title: 'Neural Signal Processing',
        image: '/images/certifications/Neural Signals.jpeg',
        link: 'https://drive.google.com/file/d/1AfFNSFMdELQJWvqBAYgNazY8PXDCuGY0/view?usp=sharing'
      },
      {
        title: 'Psychology',
        image: '/images/certifications/Psychology.jpg',
        link: 'https://drive.google.com/file/d/1iljHtQAPHMA2eDluB-gItXUIHqsmpDJs/view?usp=sharing'
      },
      {
        title: 'The Ultimate Dark Web, Anonymity, Privacy & Security Course',
        image: '/images/certifications/Dark web.png',
        link: 'https://drive.google.com/file/d/1xbF3MqjNb_NscEeLrFZsFbmsJhQX9os5/view?usp=sharing'
      }
    ]
  }
];

export default function CertificationsPage() {
  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden pb-32 sm:pb-20 md:pb-24 lg:pb-28 scroll-smooth">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] md:w-[700px] lg:w-[800px] h-[300px] sm:h-[500px] md:h-[700px] lg:h-[800px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[400px] md:w-[550px] lg:w-[600px] h-[250px] sm:h-[400px] md:h-[550px] lg:h-[600px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">
        {/* Back link */}
        <Link
          href="/#about"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all duration-300 mb-4 sm:mb-6 md:mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider">
            Back to Journey
          </span>
        </Link>

        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-14 lg:mb-16 text-center">
          <div className="inline-block bg-black/50 px-3 sm:px-4 md:px-6 py-1 border border-blue-500/30 rounded-full backdrop-blur-md mb-3 sm:mb-4 md:mb-6">
            <span className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-blue-400">
              Continuous Learning
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight mb-3 sm:mb-4 px-2">
            CERTIFICATIONS
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-3xl mx-auto px-4 sm:px-6">
            A comprehensive collection of certifications across AI, Robotics, Cloud Computing, and specialized domains.
            Each certification represents deep technical knowledge and hands-on expertise.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12 lg:mb-16 max-w-4xl mx-auto">
          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/10 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm">
            <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">22</div>
            <div className="font-mono text-[10px] sm:text-xs md:text-sm text-text-muted">Total Certs</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/10 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm">
            <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">5</div>
            <div className="font-mono text-[10px] sm:text-xs md:text-sm text-text-muted">Domains</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/10 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm">
            <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">10+</div>
            <div className="font-mono text-[10px] sm:text-xs md:text-sm text-text-muted">Platforms</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg sm:rounded-xl border border-white/10 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm">
            <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-0.5 sm:mb-1">100%</div>
            <div className="font-mono text-[10px] sm:text-xs md:text-sm text-text-muted">Commitment</div>
          </div>
        </div>

        {/* Certifications by Category */}
        {certifications.map((category, idx) => (
          <div key={idx} className="mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 px-1">
              <span className="text-blue-400/60 font-mono text-base sm:text-lg md:text-xl">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="leading-tight">{category.category}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {category.items.map((cert, certIdx) => (
                <CertificateCard key={certIdx} cert={cert} />
              ))}
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16 mb-12 sm:mb-0 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-blue-500/5 border border-blue-500/20 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm md:text-base text-white/70 text-center leading-relaxed">
            <span className="font-mono text-blue-400 font-semibold">Note:</span> All certifications are earned through rigorous coursework,
            practical projects, and assessments. Each represents hands-on expertise in the respective domain.
          </p>
        </div>
      </div>
    </div>
  );
}
