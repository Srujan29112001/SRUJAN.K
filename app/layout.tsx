import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { SupportPopup } from '@/components/ui/SupportPopup';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'K Srujan | AI/ML Engineer & Robotics Specialist',
  description:
    'Engineering Intelligence. Questioning Its Foundations. AI/ML Engineer specializing in computer vision, robotics, and consciousness research.',
  keywords: [
    'AI Engineer',
    'ML Engineer',
    'Robotics',
    'Computer Vision',
    'PyTorch',
    'ROS2',
    'Deep Learning',
    'DRDO',
    'Consciousness Research',
  ],
  authors: [{ name: 'K Srujan' }],
  creator: 'K Srujan',
  openGraph: {
    title: 'K Srujan | AI/ML Engineer',
    description: 'Engineering Intelligence. Questioning Its Foundations.',
    type: 'website',
    locale: 'en_US',
    url: 'https://srujan.dev',
    siteName: 'K Srujan Portfolio',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'K Srujan - AI/ML Engineer & Robotics Specialist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K Srujan | AI/ML Engineer',
    description: 'Engineering Intelligence. Questioning Its Foundations.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#6D64A3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-bg-base font-body text-text-primary antialiased">
        <SmoothScrollProvider>
          <GrainOverlay />
          <SupportPopup />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
