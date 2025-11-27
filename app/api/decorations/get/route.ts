import { NextRequest, NextResponse } from 'next/server';
import { supabase, DECORATIONS_TABLE } from '@/lib/supabase';

/**
 * GET /api/decorations/get?photoId=XXX
 * 특정 사진의 데코레이션을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // DB에서 조회
    const { data: decorationData, error } = await supabase
      .from(DECORATIONS_TABLE)
      .select('*')
      .eq('photo_id', photoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (정상 케이스)
      console.error('Decorations DB 조회 오류:', error);
      throw error;
    }

    // 데코레이션이 없으면 빈 배열 반환
    if (!decorationData) {
      return NextResponse.json({
        photoId,
        decorations: [],
      });
    }

    return NextResponse.json({
      photoId,
      decorations: decorationData.decorations || [],
      updatedAt: decorationData.updated_at,
    });
  } catch (error) {
    console.error('데코레이션 조회 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `데코레이션 조회 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
