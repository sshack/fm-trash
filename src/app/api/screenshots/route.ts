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

    console.log('POST /api/screenshots - Form data received:', {
      file:
        file instanceof File
          ? `File: ${file.name} (${file.size} bytes)`
          : 'No file',
      journeyId: journeyIdRaw,
      hasOtherFields: {
        name: !!formData.get('name'),
        description: !!formData.get('description'),
        position: !!formData.get('position'),
      },
    });

    if (!(file instanceof File) || typeof journeyIdRaw !== 'string') {
      return NextResponse.json(
        { message: 'file and journeyId are required' },
        { status: 400 }
      );
    }

    // Check if we're in development mode and S3 env vars are missing
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasS3Config =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME;

    let uploadUrl: string;

    if (isDevelopment && !hasS3Config) {
      // Development mode without S3 - use a mock URL
      console.log('Development mode: Using mock URL for file upload');
      uploadUrl = `https://mock-storage.dev/screenshots/${Date.now()}_${
        file.name
      }`;
    } else {
      // Production mode or development with S3 config
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}_${file.name}`;

      console.log('Uploading to S3:', { fileName, fileSize: buffer.length });

      const upload = await uploadToS3(
        buffer,
        fileName,
        file.type || 'application/octet-stream',
        'screenshots'
      );

      console.log('S3 upload result:', upload);

      if (!upload.success || !upload.url) {
        console.error('S3 upload failed:', upload);
        return NextResponse.json(
          {
            message: 'Failed to upload screenshot',
            details: upload.error || 'S3 upload error',
          },
          { status: 500 }
        );
      }

      uploadUrl = upload.url;
    }

    const name = formData.get('name');
    const description = formData.get('description');
    const type = formData.get('type');
    const positionRaw = formData.get('position');
    const position = typeof positionRaw === 'string' ? Number(positionRaw) : 0;

    console.log('Creating screenshot in database:', {
      journeyId: Number(journeyIdRaw),
      url: uploadUrl,
      name: typeof name === 'string' ? name : null,
      description: typeof description === 'string' ? description : null,
      position: Number.isFinite(position) ? position : 0,
    });

    const created = await prisma.screenshot.create({
      data: {
        journeyId: Number(journeyIdRaw),
        url: uploadUrl,
        name: typeof name === 'string' ? name : null,
        description: typeof description === 'string' ? description : null,
        position: Number.isFinite(position) ? position : 0,
        type: typeof type === 'string' ? type : null,
      },
      include: includeScreenshot,
    });

    console.log('Screenshot created successfully:', created.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Screenshot creation error:', error);
    return NextResponse.json(
      {
        message: 'Failed to create screenshot',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
