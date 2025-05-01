//api/revalidate/route.ts
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== process.env.REVALIDATE_SECRET)
    return NextResponse.json({ revalidated: false, message: 'Invalid token' }, { status: 401 });
  const path = searchParams.get('path');
  await revalidatePath(path!);
  return NextResponse.json({ revalidated: true });
}
