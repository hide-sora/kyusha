import type { APIRoute } from 'astro';
import QRCode from 'qrcode';

export const GET: APIRoute = async ({ params }) => {
  const code = params.code?.replace(/\.png$/, '');
  if (!code) {
    return new Response('Not found', { status: 404 });
  }

  const url = `https://classic-car-2026.com/verify?code=${code}`;
  const buffer = await QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
