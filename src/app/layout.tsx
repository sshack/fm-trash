import RootLayout from '@/layouts/RootLayout';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '---',
  description: '----',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </head>
        <body className={inter.className}>
          <RootLayout>{children}</RootLayout>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
