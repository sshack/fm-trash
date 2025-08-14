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

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: includeProduct });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<{ name: string }>;
    if (!body.name)
      return NextResponse.json(
        { message: 'name is required' },
        { status: 400 }
      );
    const created = await prisma.product.create({
      data: { name: body.name },
      include: includeProduct,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
