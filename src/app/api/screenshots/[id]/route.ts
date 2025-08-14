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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const screenshot = await prisma.screenshot.findUnique({
      where: { id },
      include: includeScreenshot,
    });
    if (!screenshot)
      return NextResponse.json(
        { message: 'Screenshot not found' },
        { status: 404 }
      );
    return NextResponse.json(screenshot);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch screenshot' },
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
    const contentType = req.headers.get('content-type') || '';
    let updateData: {
      url?: string;
      name?: string | null;
      description?: string | null;
      position?: number;
      type?: string | null;
    } = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const name = formData.get('name');
      const description = formData.get('description');
      const type = formData.get('type');
      const positionRaw = formData.get('position');
      if (typeof name === 'string') updateData.name = name;
      if (typeof description === 'string') updateData.description = description;
      if (typeof type === 'string') updateData.type = type;
      if (typeof positionRaw === 'string')
        updateData.position = Number(positionRaw);

      const file = formData.get('file');
      if (file instanceof File) {
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
        updateData.url = upload.url;
      }
    } else {
      const body = (await req.json()) as Partial<{
        url: string;
        name?: string | null;
        description?: string | null;
        position?: number;
        type?: string | null;
      }>;
      updateData = body;
    }

    const updated = await prisma.screenshot.update({
      where: { id },
      data: {
        ...(updateData.url !== undefined ? { url: updateData.url } : {}),
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.description !== undefined
          ? { description: updateData.description }
          : {}),
        ...(updateData.position !== undefined
          ? { position: updateData.position }
          : {}),
        ...(updateData.type !== undefined ? { type: updateData.type } : {}),
      },
      include: includeScreenshot,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update screenshot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE /api/screenshots/[id] - Starting deletion process');

    const { id: paramId } = await params;
    console.log('DELETE - Received paramId:', paramId);

    const id = Number(paramId);
    if (Number.isNaN(id)) {
      console.log('DELETE - Invalid id provided:', paramId);
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    console.log('DELETE - Deleting screenshot with id:', id);

    // Only delete from database, don't attempt S3 deletion to avoid permission issues
    const deletedScreenshot = await prisma.screenshot.delete({
      where: { id },
      select: { id: true, url: true }, // Select minimal data for logging
    });

    console.log(
      'DELETE - Successfully deleted screenshot:',
      deletedScreenshot.id
    );

    return NextResponse.json({
      success: true,
      message: 'Screenshot deleted successfully',
      id: deletedScreenshot.id,
    });
  } catch (error) {
    console.error('DELETE - Error during deletion:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        console.log('DELETE - Screenshot not found in database');
        return NextResponse.json(
          { message: 'Screenshot not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        message: 'Failed to delete screenshot',
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
