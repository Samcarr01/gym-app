import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Gym Plan Builder',
  description: 'Get a personalised workout plan in minutes.',
  keywords: ['gym', 'workout', 'fitness', 'AI', 'personal training'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="app-shell">
          <div className="app-bg" />
          <div className="app-blob app-blob-1" />
          <div className="app-blob app-blob-2" />
          <div className="app-blob app-blob-3" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
