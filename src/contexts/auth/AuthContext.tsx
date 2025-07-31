'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UserType = 'Staff' | 'Doctor' | 'Patient';

export interface User {
  id: string;
  email: string;
  name: string;
  fullName: string;
  type: UserType;
  owner: boolean;
  roleId?: string;
  clinicId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  bypassAuth: (userType: UserType) => void;
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  bypassAuth: () => {},
  debugMode: false,
  setDebugMode: () => {},
});

// Mock clinic data - in a real app, this would come from your backend
const mockClinicId = '1';
const mockRoles: Record<
  string,
  { roleId: string; owner: boolean; type: UserType }
> = {
  'admin@clinic.com': { roleId: '1', owner: true, type: 'Staff' },
  'doctor@clinic.com': { roleId: '2', owner: false, type: 'Doctor' },
  'staff@clinic.com': { roleId: '3', owner: false, type: 'Staff' },
};

// Mock users for different roles
const mockUsers: Record<UserType, User> = {
  Staff: {
    id: 'mock-staff-id',
    email: 'staff@example.com',
    name: 'Staff User',
    fullName: 'Staff User (Debug)',
    type: 'Staff',
    owner: false,
    roleId: '3',
    clinicId: mockClinicId,
  },
  Doctor: {
    id: 'mock-doctor-id',
    email: 'doctor@example.com',
    name: 'Doctor User',
    fullName: 'Doctor User (Debug)',
    type: 'Doctor',
    owner: false,
    roleId: '2',
    clinicId: mockClinicId,
  },
  Patient: {
    id: 'mock-patient-id',
    email: 'patient@example.com',
    name: 'Patient User',
    fullName: 'Patient User (Debug)',
    type: 'Patient',
    owner: false,
    clinicId: mockClinicId,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded: isClerkLoaded, signOut, getToken } = useClerkAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const router = useRouter();

  // If not in debug mode, check for actual Clerk authentication
  const isLoading = !debugMode && (!isClerkLoaded || !isUserLoaded);

  useEffect(() => {
    // Skip clerk auth if in debug mode
    if (debugMode) return;

    if (isClerkLoaded && isUserLoaded && clerkUser) {
      // Get the primary email
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

      if (!primaryEmail) return;

      // Get mock role data based on email
      const roleData = mockRoles[primaryEmail] || {
        roleId: undefined,
        owner: false,
        type: 'Staff' as UserType,
      };

      // Create user object with Clerk data + mock role data
      const userWithRole: User = {
        id: clerkUser.id,
        email: primaryEmail,
        name: clerkUser.username || clerkUser.firstName || 'User',
        fullName: `${clerkUser.firstName || ''} ${
          clerkUser.lastName || ''
        }`.trim(),
        clinicId: mockClinicId,
        ...roleData,
      };

      setUser(userWithRole);
    } else if (!debugMode) {
      setUser(null);
    }
  }, [clerkUser, isClerkLoaded, isUserLoaded, debugMode]);

  // Store Clerk JWT in localStorage for each authenticated session
  useEffect(() => {
    if (debugMode) return;

    const storeToken = async () => {
      if (isClerkLoaded) {
        const token = await getToken();
        if (token) {
          localStorage.setItem('accessToken', token);
        }
      }
    };

    storeToken();
  }, [isClerkLoaded, getToken, debugMode]);

  const logout = async () => {
    if (debugMode) {
      // Just clear the user in debug mode
      setUser(null);
      setDebugMode(false);
    } else {
      // Normal logout with Clerk
      await signOut();
    }
    localStorage.removeItem('accessToken');
    router.push('/auth/sign-in');
  };

  // Function to bypass auth and set a mock user
  const bypassAuth = (userType: UserType) => {
    setDebugMode(true);
    setUser(mockUsers[userType]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        bypassAuth,
        debugMode,
        setDebugMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
