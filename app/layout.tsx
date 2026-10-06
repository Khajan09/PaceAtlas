import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pace Atlas — Find Your Next Marathon',
  description: 'Discover upcoming city marathons and compare race dates, registration deadlines, and entry status.',
  metadataBase: new URL('https://pace-atlas-marathons.khajan-y.chatgpt.site'),
  openGraph: {
    title: 'Pace Atlas — Find Your Next Marathon',
    description: 'Discover upcoming city marathons and compare race dates, registration deadlines, and entry status.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pace Atlas — Find Your Next Marathon',
    description: 'Discover upcoming city marathons and compare race dates, registration deadlines, and entry status.',
    images: ['/og.png'],
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
