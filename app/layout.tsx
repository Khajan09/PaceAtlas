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
  title: 'Miles Ahead — Find Your Next Adventure',
  description: 'Discover road races, trail and mountain adventures, ultras, and official IRONMAN events worldwide.',
  metadataBase: new URL('https://paceatlas.khajansyadav.workers.dev'),
  openGraph: {
    title: 'Miles Ahead — Find Your Next Adventure',
    description: 'Explore endurance events by activity, date, registration status, geography, list, and map.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miles Ahead — Find Your Next Adventure',
    description: 'Explore endurance events by activity, date, registration status, geography, list, and map.',
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
