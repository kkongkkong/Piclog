import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';

/**
 * POST /api/photos/update-url
 * 사진의 URL을 업데이트합니다 (누끼 따기 후 사진 변경)
 *
 * Body: {
 *   photoId: string;
 *   imageUrl: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { photoId, imageUrl } = await request.json();

    if (!photoId || !imageUrl) {
      return NextResponse.json(
        { error: 'photoId와 imageUrl이 필요합니다' },
        { status: 400 }
      );
    }

    // 사진 테이블 업데이트
    const { data, error } = await supabase
      .from(PHOTOS_TABLE)
      .update({
        url: imageUrl,
      })
      .eq('id', photoId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: '사진이 업데이트되었습니다',
    });
  } catch (error) {
    console.error('사진 업데이트 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `사진 업데이트 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
