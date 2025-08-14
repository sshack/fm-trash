import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma, User } from '@prisma/client';

export async function GET(): Promise<
  NextResponse<User[] | { message: string }>
> {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<User | { message: string }>> {
  try {
    const body = (await req.json()) as Partial<
      Pick<User, 'authId' | 'name' | 'email'>
    >;
    if (!body.authId || !body.name || !body.email) {
      return NextResponse.json(
        { message: 'authId, name and email are required' },
        { status: 400 }
      );
    }
    const created = await prisma.user.create({
      data: { authId: body.authId, name: body.name, email: body.email },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
