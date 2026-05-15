import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: { default: 'ToolsHub — All-in-One PDF, Media & AI Tools', template: '%s | ToolsHub' },
  description: 'Free online tools: Merge PDF, Convert PDF, Download Videos, AI Plagiarism Checker and more. Fast, secure, no signup required.',
  keywords: ['PDF tools', 'merge PDF', 'compress PDF', 'video downloader', 'plagiarism checker', 'PDF to Word'],
  authors: [{ name: 'ToolsHub' }],
  openGraph: {
    title: 'ToolsHub — All-in-One PDF, Media & AI Tools',
    description: 'Free online tools for PDF, media downloading, and AI-powered plagiarism checking.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
