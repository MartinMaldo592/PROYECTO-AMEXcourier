import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || 'e105ff0c57a9dea78b70f70155b31190';
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'fa064fd9ac98a41526084ad9d27fcd48';
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '4833a2045daf645454a91a587b3ee204032d6dab3b8d32e812aa6a8c2fefc9a8';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bucket-main-proyects-personal';
export const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'https://pub-dcb2789e802043768fa5c6c649f9c405.r2.dev';
export const R2_ROOT_FOLDER = process.env.CLOUDFLARE_R2_ROOT_FOLDER || 'FOLDER AMEX';

/**
 * Subir archivo a Cloudflare R2 dentro del directorio raíz 'FOLDER AMEX'
 */
export async function uploadFileToR2(
  fileBuffer: Buffer,
  subPath: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  // Asegura que todos los archivos se guarden dentro de 'FOLDER AMEX/'
  const cleanSubPath = subPath.replace(/^\/+/, '');
  const key = `${R2_ROOT_FOLDER}/${cleanSubPath}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Codificar URI para evitar problemas con espacios en 'FOLDER AMEX'
  const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const url = `${R2_PUBLIC_DOMAIN}/${encodedKey}`;

  return { url, key };
}
