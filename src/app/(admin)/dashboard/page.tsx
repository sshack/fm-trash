'use client';

import { UserButton, useUser } from '@clerk/nextjs';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">
        Bem-vindo, {user?.firstName || user?.username}!
      </h1>
      <p className="mb-6 text-gray-600">Você está autenticado via Clerk.</p>

      {/* Clerk built-in button that handles sign-out and user profile */}
      <UserButton afterSignOutUrl="/auth/sign-in" />
    </main>
  );
}
