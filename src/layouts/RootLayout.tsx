'use client';

import { Toaster } from '@/components/sonner';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
