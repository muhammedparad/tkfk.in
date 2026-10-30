import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const settings = await DBService.getSiteSettings();
    return NextResponse.json({
      success: true,
      settings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    console.error('[API SITE SETTINGS GET ERROR]', err);
    return NextResponse.json({ error: 'Failed to load site settings' }, { status: 500 });
  }
}
