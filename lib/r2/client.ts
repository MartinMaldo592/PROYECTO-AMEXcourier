import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno "${name}". Configúrala en .env.local`);
  }
  return value;
}

const accountId = requireEnv('CLOUDFLARE_R2_ACCOUNT_ID');
const accessKeyId = requireEnv('CLOUDFLARE_R2_ACCESS_KEY_ID');
const secretAccessKey = requireEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY');

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = requireEnv('CLOUDFLARE_R2_BUCKET_NAME');
export const R2_PUBLIC_DOMAIN = requireEnv('CLOUDFLARE_R2_PUBLIC_DOMAIN');
export const R2_ROOT_FOLDER = requireEnv('CLOUDFLARE_R2_ROOT_FOLDER');

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
