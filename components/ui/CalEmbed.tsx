'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';

interface CalEmbedProps {
    calLink: string;
    onBookingSuccess?: () => void;
}

export function CalEmbed({ calLink, onBookingSuccess }: CalEmbedProps) {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi();

            // Style the embed to match dark theme
            cal('ui', {
                theme: 'dark',
                styles: {
                    branding: { brandColor: '#06b6d4' }, // cyan-500
                },
                hideEventTypeDetails: false,
                layout: 'month_view',
            });

            // Listen for booking success
            if (onBookingSuccess) {
                cal('on', {
                    action: 'bookingSuccessful',
                    callback: () => {
                        onBookingSuccess();
                    },
                });
            }
        })();
    }, [onBookingSuccess]);

    return (
        <div className="relative w-full min-h-[600px] rounded-2xl overflow-hidden border border-cyan-900/30 bg-[#0a0a0f]">
            {/* Loading skeleton */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] z-0">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <p className="font-mono text-sm text-white/40">Loading calendar...</p>
                </div>
            </div>

            {/* Cal.com embed */}
            <Cal
                calLink={calLink}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '600px',
                    overflow: 'scroll',
                }}
                config={{
                    theme: 'dark',
                }}
            />
        </div>
    );
}

export default CalEmbed;
