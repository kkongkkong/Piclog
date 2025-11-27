import { NextRequest, NextResponse } from 'next/server';
import { supabase, DECORATIONS_TABLE } from '@/lib/supabase';

/**
 * POST /api/decorations/delete
 * 특정 사진의 decoration 데이터를 삭제합니다.
 *
 * Body: {
 *   photoId: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId가 필요합니다' },
        { status: 400 }
      );
    }

    // Decoration 데이터 삭제
    const { error } = await supabase
      .from(DECORATIONS_TABLE)
      .delete()
      .eq('photo_id', photoId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Decoration이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Decoration 삭제 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `Decoration 삭제 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
