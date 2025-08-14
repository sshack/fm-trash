import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { User } from '@prisma/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<User | { message: string }>> {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<User | { message: string }>> {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const body = (await req.json()) as Partial<Pick<User, 'name' | 'email'>>;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { message: string }>> {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
