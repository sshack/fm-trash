import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const includeProduct = {
  variants: {
    include: {
      journeys: {
        include: {
          screenshots: true,
          institution: true,
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: includeProduct,
    });
    if (!product)
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const body = (await req.json()) as Partial<{ name: string }>;
    const updated = await prisma.product.update({
      where: { id },
      data: { ...(body.name !== undefined ? { name: body.name } : {}) },
      include: includeProduct,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
