'use client';

// Global navigation state to track when programmatic navigation is in progress
// Video transitions should NOT play during programmatic navigation (nav clicks)

let navigating = false;
let timeoutId: NodeJS.Timeout | null = null;

// Track when video transitions are playing (for hiding navbar)
let videoPlaying = false;
let videoPlayingCallbacks: Array<(playing: boolean) => void> = [];

/**
 * Set navigation state - call with true when starting nav, false when done
 * Automatically resets after 2 seconds as a safety measure
 */
export function setNavigating(value: boolean): void {
    navigating = value;

    // Clear any existing timeout
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }

    // Auto-reset after navigation completes (safety timeout)
    if (value) {
        timeoutId = setTimeout(() => {
            navigating = false;
            timeoutId = null;
        }, 2000); // 2 seconds should cover most smooth scroll durations
    }
}

/**
 * Check if navigation is currently in progress
 */
export function isNavigating(): boolean {
    return navigating;
}

/**
 * Set video playing state - used to hide navbar during transitions
 */
export function setVideoPlaying(value: boolean): void {
    videoPlaying = value;
    // Notify all subscribers
    videoPlayingCallbacks.forEach(callback => callback(value));
}

/**
 * Check if video is currently playing
 */
export function isVideoPlaying(): boolean {
    return videoPlaying;
}

/**
 * Subscribe to video playing state changes (for React components)
 */
export function subscribeToVideoPlaying(callback: (playing: boolean) => void): () => void {
    videoPlayingCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
        videoPlayingCallbacks = videoPlayingCallbacks.filter(cb => cb !== callback);
    };
}
