import { NextRequest, NextResponse } from 'next/server';
import { DBService } from '@/services/db';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!getAdminSessionFromRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
    const questions = await DBService.getAdminQuestions();
    return NextResponse.json(questions);
  } catch (err: any) {
    console.error('[API ADMIN QUESTIONS GET ERROR]', err);
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
    const newQ = await DBService.createQuestion(body);
    await DBService.logAdminAction(session.userId, 'CREATE_QUESTION', 'QUESTION', newQ.id, {
      question_text: newQ.question_text
    });
    return NextResponse.json({ success: true, question: newQ });
  } catch (err: any) {
    console.error('[API ADMIN QUESTIONS POST ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

    const updated = await DBService.updateQuestion(id, data);
    await DBService.logAdminAction(session.userId, 'UPDATE_QUESTION', 'QUESTION', id);
    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    console.error('[API ADMIN QUESTIONS PUT ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

    await DBService.deleteQuestion(id);
    await DBService.logAdminAction(session.userId, 'DELETE_QUESTION', 'QUESTION', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API ADMIN QUESTIONS DELETE ERROR]', err);
    return NextResponse.json({ error: 'Request could not be completed.' }, { status: 500 });
  }
}
