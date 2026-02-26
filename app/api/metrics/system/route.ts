import { NextResponse } from 'next/server';
import { getSystemInfo } from '@/lib/metrics';

export async function GET() {
  try {
    const systemInfo = await getSystemInfo();
    return NextResponse.json(systemInfo);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to get system info' },
      { status: 500 }
    );
  }
}
