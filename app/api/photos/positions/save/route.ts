import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTO_POSITIONS_TABLE } from '@/lib/supabase';

/**
 * POST /api/photos/positions/save
 * 드래그로 조정된 사진의 위치를 저장합니다.
 *
 * Body: {
 *   photoId: string;
 *   timeBlockTime: string; // e.g., "09:00"
 *   x: number;
 *   y: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { photoId, timeBlockTime, x, y } = await request.json();

    if (!photoId || !timeBlockTime || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: 'photoId, timeBlockTime, x, y가 필요합니다' },
        { status: 400 }
      );
    }

    // UPSERT: 기존 위치가 있으면 업데이트, 없으면 생성
    const { data, error } = await supabase
      .from(PHOTO_POSITIONS_TABLE)
      .upsert(
        {
          photo_id: photoId,
          time_block: timeBlockTime,
          x: parseFloat(String(x)),
          y: parseFloat(String(y)),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'photo_id, time_block' }
      )
      .select()
      .single();

    if (error) {
      console.error('사진 위치 저장 오류:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: '사진 위치가 저장되었습니다',
    });
  } catch (error) {
    console.error('사진 위치 저장 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `사진 위치 저장 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
