import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Srujan AI - Digital Twin | K Srujan',
    description: 'Chat with my AI digital twin. Get project estimates, learn about my work, or book a consultation. Your 24/7 gateway to connecting with K Srujan.',
    keywords: [
        'AI Assistant',
        'Digital Twin',
        'Project Estimate',
        'Consultation',
        'AI/ML Engineer',
        'Srujan',
    ],
    openGraph: {
        title: 'Srujan AI - Digital Twin',
        description: 'Chat with my AI digital twin. Get project estimates, learn about my work, or book a consultation.',
        type: 'website',
        url: 'https://srujan.dev/ai-assistant',
    },
};

export default function AIAssistantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Script runs before React hydration to prevent scroll restoration */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        if (typeof window !== 'undefined') {
                            history.scrollRestoration = 'manual';
                            window.scrollTo(0, 0);
                        }
                    `,
                }}
            />
            {children}
        </>
    );
}
