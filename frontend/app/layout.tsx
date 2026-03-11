import type React from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import "@fontsource/dm-sans";
import "@fontsource/space-mono";
import "@fontsource/source-serif-4";
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

import { LanguageProvider } from '@/context/LanguageContext';
import { SidebarProvider } from '@/context/sidebar-context';

export const metadata: Metadata = {
  title: 'MENTIS - Early Psychological Risk Detection',
  description: 'Early detection of psychoemotional risk indicators in university students',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon_logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon_logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon_logo.png',
        type: 'image/png',
      },
    ],
    apple: '/icon_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
            <Toaster />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
