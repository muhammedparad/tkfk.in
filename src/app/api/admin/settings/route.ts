import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const settings = await DBService.getSiteSettings();
    const studyConfig = await DBService.getStudyMaterialConfig();
    const dataMode = process.env.DATA_MODE || 'mock';

    return NextResponse.json({
      success: true,
      settings,
      dataMode,
      studyMaterial: studyConfig,
      adminSecretConfigured: Boolean(process.env.ADMIN_SECRET_KEY || process.env.ADMIN_LOGIN_SECRET),
      adminUser: {
        id: session.userId,
        email: session.email,
        role: session.role || 'super_admin'
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err: any) {
    console.error('[API ADMIN SETTINGS GET ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { settings, studyMaterial } = body;

    let updatedSettings = null;
    if (settings && typeof settings === 'object') {
      updatedSettings = await DBService.updateSiteSettings(settings, session.userId);
    }

    if (studyMaterial) {
      await DBService.updateStudyMaterialConfig(studyMaterial);
      await DBService.logAdminAction(session.userId, 'UPDATE_SETTINGS', 'SYSTEM_CONFIG', 'study_material', {
        studyMaterial
      });
    }

    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings || (await DBService.getSiteSettings()) 
    });
  } catch (err: any) {
    console.error('[API ADMIN SETTINGS POST ERROR]', err);
    return NextResponse.json({ error: err.message || 'Request could not be completed.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
