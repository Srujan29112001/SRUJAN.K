'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

// Only register plugins on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Custom easing curves
  CustomEase.create('smooth', '0.23, 1, 0.32, 1');
  CustomEase.create('smoothOut', '0.22, 1, 0.36, 1');
  CustomEase.create('dramatic', '0.87, 0, 0.13, 1');
  CustomEase.create('elastic', '0.68, -0.55, 0.265, 1.55');

  // Performance config
  gsap.config({
    force3D: true,
  });

  // Set defaults
  gsap.defaults({
    ease: 'power3.out',
    duration: 0.8,
  });
}

export { gsap, ScrollTrigger, CustomEase };
