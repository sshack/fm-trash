import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadToS3 } from '@/lib/s3';

type InstitutionWithRelations = Prisma.InstitutionGetPayload<{
  include: typeof includeInstitution;
}>;

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

export async function GET(): Promise<NextResponse<InstitutionWithRelations[]>> {
  try {
    const institutions = await prisma.institution.findMany({
      include: includeInstitution,
    });
    return NextResponse.json(institutions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}

interface CreateInstitutionBody {
  name: string;
  sector: string;
  logo: string; // URL string only (upload handled later)
}

export async function POST(
  req: Request
): Promise<NextResponse<InstitutionWithRelations | { message: string }>> {
  try {
    const formData = await req.formData();
    const name = String(formData.get('name') ?? '');
    const sector = String(formData.get('sector') ?? '');
    const file = formData.get('file');

    if (!name || !sector || !(file instanceof File)) {
      return NextResponse.json(
        { message: 'name, sector and file are required' },
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
      'institutions'
    );
    if (!upload.success || !upload.url) {
      return NextResponse.json(
        { message: 'Failed to upload logo' },
        { status: 500 }
      );
    }

    const created = await prisma.institution.create({
      data: {
        name,
        sector,
        logo: upload.url,
      },
      include: includeInstitution,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to create institution' },
      { status: 500 }
    );
  }
}
