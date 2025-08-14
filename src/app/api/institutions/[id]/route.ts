import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadToS3 } from '@/lib/s3';

const includeInstitution = {
  journeys: {
    include: {
      productVariant: {
        include: {
          product: true,
        },
      },
      screenshots: true,
    },
  },
} satisfies Prisma.InstitutionInclude;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id))
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  try {
    const institution = await prisma.institution.findUnique({
      where: { id },
      include: includeInstitution,
    });
    if (!institution)
      return NextResponse.json(
        { message: 'Institution not found' },
        { status: 404 }
      );
    return NextResponse.json(institution);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch institution' },
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
    const contentType = req.headers.get('content-type') || '';
    let updateData: { name?: string; sector?: string; logo?: string } = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const name = formData.get('name');
      const sector = formData.get('sector');
      const file = formData.get('file');
      if (typeof name === 'string') updateData.name = name;
      if (typeof sector === 'string') updateData.sector = sector;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}_${file.name}`;
        const upload = await uploadToS3(
          buffer,
          fileName,
          file.type || 'application/octet-stream',
          'institutions'
        );
        if (!upload.success || !upload.url) {
          return NextResponse.json(
            { message: 'Failed to upload logo' },
            { status: 500 }
          );
        }
        updateData.logo = upload.url;
      }
    } else {
      const body = (await req.json()) as Partial<{
        name: string;
        sector: string;
        logo: string;
      }>;
      updateData = body;
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.sector !== undefined
          ? { sector: updateData.sector }
          : {}),
        ...(updateData.logo !== undefined ? { logo: updateData.logo } : {}),
      },
      include: includeInstitution,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to update institution' },
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
    await prisma.institution.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to delete institution' },
      { status: 500 }
    );
  }
}
