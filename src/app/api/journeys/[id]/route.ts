import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const includeJourney = {
  institution: true,
  productVariant: { include: { product: true } },
  screenshots: true,
} satisfies Prisma.JourneyInclude;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: includeJourney,
    });
    if (!journey)
      return NextResponse.json(
        { message: 'Journey not found' },
        { status: 404 }
      );
    return NextResponse.json(journey);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch journey' },
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
    const body = (await req.json()) as Partial<{
      name: string;
      segment: 'PF' | 'PJ';
      channel: 'WEB' | 'MOBILE';
      productVariantId: number;
      institutionId: number;
    }>;
    const updated = await prisma.journey.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.segment !== undefined ? { segment: body.segment } : {}),
        ...(body.channel !== undefined ? { channel: body.channel } : {}),
        ...(body.productVariantId !== undefined
          ? { productVariantId: Number(body.productVariantId) }
          : {}),
        ...(body.institutionId !== undefined
          ? { institutionId: Number(body.institutionId) }
          : {}),
      },
      include: includeJourney,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update journey' },
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
    await prisma.journey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete journey' },
      { status: 500 }
    );
  }
}
