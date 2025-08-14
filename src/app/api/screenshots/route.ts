import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadToS3 } from '@/lib/s3';

const includeScreenshot = {
  journey: {
    include: {
      institution: true,
      productVariant: { include: { product: true } },
    },
  },
} satisfies Prisma.ScreenshotInclude;

export async function GET() {
  try {
    const screenshots = await prisma.screenshot.findMany({
      include: includeScreenshot,
    });
    return NextResponse.json(screenshots);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch screenshots' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'multipart/form-data required' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const journeyIdRaw = formData.get('journeyId');
    if (!(file instanceof File) || typeof journeyIdRaw !== 'string') {
      return NextResponse.json(
        { message: 'file and journeyId are required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}_${file.name}`;
    const upload = await uploadToS3(
      buffer,
      fileName,
      file.type || 'application/octet-stream',
      'screenshots'
    );
    if (!upload.success || !upload.url) {
      return NextResponse.json(
        { message: 'Failed to upload screenshot' },
        { status: 500 }
      );
    }

    const name = formData.get('name');
    const description = formData.get('description');
    const type = formData.get('type');
    const positionRaw = formData.get('position');
    const position = typeof positionRaw === 'string' ? Number(positionRaw) : 0;

    const created = await prisma.screenshot.create({
      data: {
        journeyId: Number(journeyIdRaw),
        url: upload.url,
        name: typeof name === 'string' ? name : null,
        description: typeof description === 'string' ? description : null,
        position: Number.isFinite(position) ? position : 0,
        type: typeof type === 'string' ? type : null,
      },
      include: includeScreenshot,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create screenshot' },
      { status: 500 }
    );
  }
}
