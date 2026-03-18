import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://beamxsolutions.com';

export const metadata: Metadata = {
  title: {
    default: 'Business Idea Validator | BeamX Solutions',
    template: '%s | BeamX Solutions',
  },
  description:
    'Validate your business idea in 5 minutes with AI-powered analysis. Get a personalized roadmap, strength analysis, and week-by-week action plan.',
  keywords: [
    'business idea validator',
    'startup validation',
    'business assessment',
    'AI business analysis',
    'entrepreneur tools',
    'BeamX Solutions',
    'startup readiness',
    'business roadmap',
  ],
  authors: [{ name: 'BeamX Solutions', url: APP_URL }],
  creator: 'BeamX Solutions',
  publisher: 'BeamX Solutions',
  metadataBase: new URL(APP_URL),

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'BeamX Business Idea Validator',
    title: 'Is Your Business Idea Ready to Launch? | BeamX',
    description:
      'Free AI-powered assessment that scores your business idea and gives you a personalized launch roadmap. Takes less than 5 minutes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BeamX Business Idea Validator',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Is Your Business Idea Ready to Launch? | BeamX',
    description:
      'Free AI-powered assessment that scores your business idea and gives you a personalized launch roadmap.',
    images: ['/og-image.png'],
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

  icons: {
    icon: '/favicon.ico',
  },

  alternates: {
    canonical: APP_URL,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Structured data for the tool */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'BeamX Business Idea Validator',
              url: APP_URL,
              description:
                'AI-powered business idea validation tool with personalized roadmaps.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'BeamX Solutions',
                url: APP_URL,
              },
            }),
          }}
        />
        {/* Google Analytics */}
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}