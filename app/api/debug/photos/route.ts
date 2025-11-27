import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/photos
 * 디버깅용: Supabase photos 테이블의 모든 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] /api/debug/photos 요청 시작');
    console.log('[DEBUG] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Supabase에서 모든 사진 조회
    const { data, error } = await supabase
      .from(PHOTOS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    console.log('[DEBUG] Supabase 쿼리 결과:', {
      count: data?.length || 0,
      error: error?.message || 'none',
    });

    if (error) {
      console.error('[DEBUG] Supabase 에러:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    return NextResponse.json({
      success: true,
      totalCount: data?.length || 0,
      photos: data || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DEBUG] 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
