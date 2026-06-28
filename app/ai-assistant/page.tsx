'use client';

import { useEffect } from 'react';

// The AI-assistant page is now integrated into the main portfolio as the
// nav-controlled "Services" section (showing the portfolio's own navbar, and
// without the pricing calculator). Redirect any old links / bookmarks there.
export default function AIAssistantPage() {
    useEffect(() => {
        window.location.replace('/#services');
    }, []);
    return null;
}
