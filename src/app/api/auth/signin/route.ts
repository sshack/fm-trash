import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  // Clerk handles authentication, so we redirect to the new sign-in page
  return NextResponse.json(
    { message: 'Please use Clerk authentication at /auth/sign-in' },
    { status: 308 }
  );
};
