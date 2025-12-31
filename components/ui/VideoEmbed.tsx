'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface VideoEmbedProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '9/16';
  overlay?: boolean;
  playOnHover?: boolean;
  playOnScroll?: boolean;
}

export function VideoEmbed({
  src,
  poster,
  title,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  className = '',
  aspectRatio = '16/9',
  overlay = true,
  playOnHover = false,
  playOnScroll = false,
}: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Play on scroll
    if (playOnScroll) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(container);
      return () => observer.disconnect();
    }
  }, [playOnScroll]);

  const handleMouseEnter = () => {
    if (playOnHover && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (playOnHover && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowControls(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const aspectRatioClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '9/16': 'aspect-[9/16]',
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-lg bg-black ${aspectRatioClass} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls && showControls}
        playsInline
        className="h-full w-full object-cover"
        onLoadedData={() => setIsLoaded(true)}
      />

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
        </div>
      )}

      {/* Overlay */}
      {overlay && !controls && (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Play button */}
      {!controls && (
        <button
          onClick={togglePlay}
          className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/80 text-white backdrop-blur-sm transition-all hover:bg-primary hover:scale-110 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      )}

      {/* Title */}
      {title && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all ${
            showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h4 className="text-lg font-bold text-white">{title}</h4>
        </div>
      )}

      {/* Corner decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

// YouTube embed with custom styling
interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
}

export function YouTubeEmbed({
  videoId,
  title = 'Video',
  className = '',
  autoplay = false,
  showControls = true,
}: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(autoplay);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={`group relative aspect-video overflow-hidden rounded-lg bg-black ${className}`}>
      {showVideo ? (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=${showControls ? 1 : 0}&rel=0`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />

          {/* Play button */}
          <button
            onClick={() => setShowVideo(true)}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/90 text-white transition-all hover:bg-primary hover:scale-110 md:h-20 md:w-20"
          >
            <svg className="h-6 w-6 ml-1 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h4 className="text-lg font-bold text-white">{title}</h4>
            </div>
          )}
        </>
      )}

      {/* Corner decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary/50" />
        <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary/50" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary/50" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary/50" />
      </div>
    </div>
  );
}

// Video showcase grid
interface VideoShowcaseProps {
  videos: Array<{
    src?: string;
    youtubeId?: string;
    poster?: string;
    title: string;
    description?: string;
  }>;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function VideoShowcase({
  videos,
  columns = 2,
  className = '',
}: VideoShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('.video-item');

    gsap.fromTo(
      items,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        },
      }
    );
  }, []);

  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <div ref={containerRef} className={`grid gap-6 ${columnClass} ${className}`}>
      {videos.map((video, i) => (
        <div key={i} className="video-item">
          {video.youtubeId ? (
            <YouTubeEmbed videoId={video.youtubeId} title={video.title} />
          ) : video.src ? (
            <VideoEmbed
              src={video.src}
              poster={video.poster}
              title={video.title}
              playOnScroll
            />
          ) : null}
          {video.description && (
            <p className="mt-3 text-sm text-text-muted">{video.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Cinematic video hero
interface VideoHeroProps {
  src: string;
  poster?: string;
  overlayContent?: React.ReactNode;
  className?: string;
}

export function VideoHero({
  src,
  poster,
  overlayContent,
  className = '',
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Parallax effect
    gsap.to(video, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden ${className}`}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-[130%] w-full object-cover"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(255, 255, 255, 0.5) 2px,
            rgba(255, 255, 255, 0.5) 4px
          )`,
        }}
      />

      {/* Content */}
      {overlayContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {overlayContent}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="font-mono text-xs tracking-widest">SCROLL</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
