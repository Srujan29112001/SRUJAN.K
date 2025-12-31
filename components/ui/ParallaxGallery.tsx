'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  category?: string;
}

interface ParallaxGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: number;
  parallaxStrength?: number;
  className?: string;
}

// Lightbox component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex];

  useEffect(() => {
    // Animate in
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(
      contentRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
    );

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev]);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all hover:border-primary hover:bg-primary/20 md:right-8 md:top-8"
        onClick={handleClose}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all hover:border-primary hover:bg-primary/20 md:left-8"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all hover:border-primary hover:bg-primary/20 md:right-8"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image content */}
      <div
        ref={contentRef}
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full max-w-5xl">
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Image info */}
        {(currentImage.title || currentImage.description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {currentImage.category && (
              <span className="mb-2 inline-block rounded bg-primary/20 px-2 py-1 font-mono text-xs text-primary">
                {currentImage.category}
              </span>
            )}
            {currentImage.title && (
              <h3 className="mb-1 text-xl font-bold text-white">{currentImage.title}</h3>
            )}
            {currentImage.description && (
              <p className="text-sm text-white/70">{currentImage.description}</p>
            )}
          </div>
        )}

        {/* Counter */}
        <div className="absolute left-4 top-4 rounded bg-black/50 px-3 py-1 font-mono text-sm text-white/70">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-black/50 p-2 md:bottom-8">
        {images.map((img, i) => (
          <button
            key={i}
            className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded transition-all md:h-16 md:w-24 ${
              i === currentIndex ? 'ring-2 ring-primary' : 'opacity-50 hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to this image
              const diff = i - currentIndex;
              if (diff > 0) {
                for (let j = 0; j < diff; j++) onNext();
              } else {
                for (let j = 0; j < Math.abs(diff); j++) onPrev();
              }
            }}
          >
            <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

// Individual gallery item with parallax
function GalleryItem({
  image,
  index,
  onClick,
  parallaxStrength,
}: {
  image: GalleryImage;
  index: number;
  onClick: () => void;
  parallaxStrength: number;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    const img = imageRef.current;
    if (!item || !img) return;

    // Parallax effect on scroll
    gsap.fromTo(
      img,
      { y: -parallaxStrength },
      {
        y: parallaxStrength,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    // Reveal animation
    gsap.fromTo(
      item,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        delay: index * 0.1,
      }
    );
  }, [index, parallaxStrength]);

  return (
    <div
      ref={itemRef}
      className="group relative cursor-pointer overflow-hidden rounded-lg"
      onClick={onClick}
    >
      {/* Image container with overflow for parallax */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div ref={imageRef} className="absolute inset-[-20%] h-[140%] w-[140%]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
          {image.category && (
            <span className="mb-2 inline-block w-fit rounded bg-primary/20 px-2 py-1 font-mono text-[10px] text-primary">
              {image.category}
            </span>
          )}
          {image.title && (
            <h4 className="mb-1 text-lg font-bold text-white">{image.title}</h4>
          )}
          {image.description && (
            <p className="line-clamp-2 text-sm text-white/70">{image.description}</p>
          )}
        </div>

        {/* Glitch effect on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            className="absolute inset-0 mix-blend-color-dodge"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(109, 100, 163, 0.1) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>

        {/* Corner brackets */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary" />
        </div>
      </div>
    </div>
  );
}

export function ParallaxGallery({
  images,
  columns = 3,
  gap = 16,
  parallaxStrength = 30,
  className = '',
}: ParallaxGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <>
      <div className={`grid ${columnClass} ${className}`} style={{ gap }}>
        {images.map((image, index) => (
          <GalleryItem
            key={index}
            image={image}
            index={index}
            onClick={() => openLightbox(index)}
            parallaxStrength={parallaxStrength}
          />
        ))}
      </div>

      {mounted && lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
}

// Horizontal scrolling gallery with parallax
export function HorizontalGallery({
  images,
  height = 400,
  className = '',
}: {
  images: GalleryImage[];
  height?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Calculate scroll distance
    const scrollWidth = track.scrollWidth - container.offsetWidth;

    gsap.to(track, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top center',
        end: `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });
  }, []);

  return (
    <>
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        <div ref={trackRef} className="flex gap-6" style={{ height }}>
          {images.map((image, i) => (
            <div
              key={i}
              className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg"
              style={{ width: height * 1.5, height }}
              onClick={() => {
                setCurrentIndex(i);
                setLightboxOpen(true);
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={`${height * 1.5}px`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {image.title && (
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <h4 className="text-lg font-bold text-white">{image.title}</h4>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {mounted && lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        />
      )}
    </>
  );
}

// Masonry-style gallery
export function MasonryGallery({
  images,
  columns = 3,
  gap = 16,
  className = '',
}: Omit<ParallaxGalleryProps, 'parallaxStrength'>) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Split images into columns
  const columnArrays: GalleryImage[][] = Array.from({ length: columns }, () => []);
  images.forEach((img, i) => {
    columnArrays[i % columns].push(img);
  });

  return (
    <>
      <div className={`flex ${className}`} style={{ gap }}>
        {columnArrays.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-1 flex-col" style={{ gap }}>
            {column.map((image, imgIndex) => {
              const globalIndex = imgIndex * columns + colIndex;
              return (
                <div
                  key={imgIndex}
                  className="group relative cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => {
                    setCurrentIndex(globalIndex);
                    setLightboxOpen(true);
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      paddingBottom: `${60 + Math.random() * 40}%`,
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/80 text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {mounted && lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        />
      )}
    </>
  );
}
