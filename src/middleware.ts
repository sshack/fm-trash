import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/patient/(.*)', // Patient routes will have their own separate authentication
  '/patient-profile(.*)', // Patient profile pages should be public
  '/api/patient/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except the public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Update matcher to be simpler and work with Next.js
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
