import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTO_POSITIONS_TABLE } from '@/lib/supabase';

/**
 * GET /api/photos/positions/get?photoId=xxx&time=09:00
 * 저장된 사진 위치와 크기를 조회합니다.
 *
 * Query params:
 *   photoId: string
 *   time: string (timeBlockTime, e.g., "09:00")
 *
 * Response: { x: number, y: number, width?: number } or null
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    const timeBlockTime = searchParams.get('time');

    if (!photoId || !timeBlockTime) {
      return NextResponse.json(
        { error: 'photoId와 time 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // 저장된 위치 조회
    const { data, error } = await supabase
      .from(PHOTO_POSITIONS_TABLE)
      .select('x, y, width')
      .eq('photo_id', photoId)
      .eq('time_block', timeBlockTime)
      .single();

    if (error) {
      // 404는 정상 (아직 위치 정보가 없음)
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      console.error('사진 위치 조회 오류:', error);
      throw error;
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('사진 위치 조회 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `사진 위치 조회 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
