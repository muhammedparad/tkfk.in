import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!getAdminSessionFromRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
    const studyConfig = await DBService.getStudyMaterialConfig();
    const dataMode = process.env.DATA_MODE || 'mock';
    return NextResponse.json({
      dataMode,
      studyMaterial: studyConfig,
      adminSecretConfigured: Boolean(process.env.ADMIN_SECRET_KEY || process.env.ADMIN_LOGIN_SECRET)
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
    const { studyMaterial } = body;

    if (studyMaterial) {
      await DBService.updateStudyMaterialConfig(studyMaterial);
      await DBService.logAdminAction(session.userId, 'UPDATE_SETTINGS', 'SYSTEM_CONFIG', 'study_material', {
        studyMaterial
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API ADMIN SETTINGS POST ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
