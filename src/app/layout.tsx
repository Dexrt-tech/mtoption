import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Meta Trading Option — Trade Smarter. Grow Faster.',
  description: 'Meta Trading Option is your ultimate companion for tracking, analyzing, and managing your cryptocurrency and investment portfolio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#03060d', color: '#fff', border: '1px solid #1d222b' },
            success: { iconTheme: { primary: '#ff6a5e', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
