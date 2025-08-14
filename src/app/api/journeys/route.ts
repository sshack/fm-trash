import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const includeJourney = {
  institution: true,
  productVariant: { include: { product: true } },
  screenshots: true,
} satisfies Prisma.JourneyInclude;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get('institutionId');
    const where: Prisma.JourneyWhereInput | undefined = institutionId
      ? { institutionId: Number(institutionId) }
      : undefined;
    const journeys = await prisma.journey.findMany({
      where,
      include: includeJourney,
    });
    return NextResponse.json(journeys);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<{
      name: string;
      segment: 'PF' | 'PJ';
      channel: 'WEB' | 'MOBILE';
      productVariantId: number;
      institutionId: number;
    }>;
    const required =
      body.name &&
      body.segment &&
      body.channel &&
      body.productVariantId &&
      body.institutionId;
    if (!required)
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    const created = await prisma.journey.create({
      data: {
        name: body.name!,
        segment: body.segment!,
        channel: body.channel!,
        productVariantId: Number(body.productVariantId),
        institutionId: Number(body.institutionId),
      },
      include: includeJourney,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create journey' },
      { status: 500 }
    );
  }
}
