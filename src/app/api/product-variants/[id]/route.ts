import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const includeVariant = {
  product: true,
  journeys: {
    include: {
      screenshots: true,
      institution: true,
    },
  },
} satisfies Prisma.ProductVariantInclude;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: includeVariant,
    });
    if (!variant)
      return NextResponse.json(
        { message: 'Variant not found' },
        { status: 404 }
      );
    return NextResponse.json(variant);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const body = (await req.json()) as Partial<{
      name: string;
      productId: number;
    }>;
    const updated = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.productId !== undefined
          ? { productId: Number(body.productId) }
          : {}),
      },
      include: includeVariant,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    await prisma.productVariant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
