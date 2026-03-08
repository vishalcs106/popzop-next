import { NextRequest, NextResponse } from 'next/server';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN!;

export async function POST(req: NextRequest) {
  if (!ACCOUNT_ID || !API_TOKEN) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cfForm = new FormData();
    cfForm.append('file', file);

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: cfForm,
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error('[upload] Cloudflare error:', data.errors);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Return the first variant URL (public delivery URL)
    const url: string = data.result.variants[0];
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
