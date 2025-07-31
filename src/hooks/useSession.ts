import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SessionProps {
  session: any | null;
  signOut(): void;
}

export function useSession(): SessionProps {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut().then(() => {
      router.push('/auth/sign-in');
    });
  };

  return {
    session: isSignedIn ? user : null,
    signOut: handleSignOut,
  };
}
