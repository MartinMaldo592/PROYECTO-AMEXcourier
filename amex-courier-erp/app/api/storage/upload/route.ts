import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'facturas';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timeStamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const subPath = `${folder}/${timeStamp}_${sanitizedName}`;

    const { url, key } = await uploadFileToR2(buffer, subPath, file.type);

    return NextResponse.json({
      success: true,
      url,
      key
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al subir archivo a Cloudflare R2';
    console.error('[R2 Upload Error]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
