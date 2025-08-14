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

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: includeVariant,
    });
    return NextResponse.json(variants);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<{
      name: string;
      productId: number;
    }>;
    if (!body.name || !body.productId)
      return NextResponse.json(
        { message: 'name and productId are required' },
        { status: 400 }
      );
    const created = await prisma.productVariant.create({
      data: { name: body.name, productId: Number(body.productId) },
      include: includeVariant,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create variant' },
      { status: 500 }
    );
  }
}
