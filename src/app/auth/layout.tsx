'use client';

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-center mb-2">Bem-vindo</h1>
          <p className="text-center text-muted-foreground">
            Faça login para acessar
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
