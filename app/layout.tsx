import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeamX Solutions - Business Idea Validator",
  description: "Validate your startup idea with AI-powered insights and data-driven recommendations from BeamX Solutions.",
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'BeamX Solutions - Business Idea Validator',
    description: 'Validate your startup idea with AI-powered insights',
    siteName: 'BeamX Solutions',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeamX Solutions - Business Idea Validator',
    description: 'Validate your startup idea with AI-powered insights',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
