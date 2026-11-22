import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Camera and live proctoring frame ingestion has been decommissioned.
 * Returning HTTP 410 Gone for compatibility with any legacy client workers.
 */
export async function POST() {
  return NextResponse.json(
    {
      retired: true,
      message: 'Camera and live proctoring telemetry has been decommissioned.',
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      retired: true,
      message: 'Camera and live proctoring telemetry has been decommissioned.',
    },
    { status: 410 }
  );
}
