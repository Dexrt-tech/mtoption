import crypto from 'crypto';

function sign(params: Record<string, string>, secret: string): string {
  const str = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(str + secret).digest('hex');
}

export async function uploadToCloudinary(file: File, folder = 'deposits'): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const MAX_ATTEMPTS = 4;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const params: Record<string, string> = { folder, timestamp };
    const signature = sign(params, apiSecret);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', apiKey);
    fd.append('timestamp', timestamp);
    fd.append('signature', signature);
    fd.append('folder', folder);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: fd, signal: controller.signal }
      );
      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: { message?: string } }).error?.message ?? 'Cloudinary upload failed';
        // 4xx errors (bad signature, invalid file, etc.) won't be fixed by retrying
        if (res.status < 500) throw new Error(msg);
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        throw new Error(msg);
      }

      const data = await res.json() as { secure_url: string };
      return data.secure_url;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        throw new Error('Upload timed out. Please try again.');
      }
      // Re-throw non-retryable errors immediately
      if (attempt >= MAX_ATTEMPTS || err.message?.includes('Cloudinary')) throw err;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error('Upload failed after multiple attempts.');
}
