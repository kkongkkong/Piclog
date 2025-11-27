import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE, PHOTOS_BUCKET, PHOTO_POSITIONS_TABLE, DECORATIONS_TABLE } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/photos/delete
 * 사진을 삭제합니다 (DB와 Storage에서 모두 삭제)
 * 관련 데이터도 함께 삭제:
 * - photo_positions (사진 위치)
 * - decorations (장식)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, url } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: '사진 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Storage에서 파일 삭제
    if (url) {
      try {
        // URL에서 파일 경로 추출
        // 예: https://xxx.supabase.co/storage/v1/object/public/photos/photos/uuid-filename.jpg
        const urlParts = url.split('/photos/');
        if (urlParts.length > 1) {
          const filePath = `photos/${urlParts[1]}`;
          await supabase.storage.from(PHOTOS_BUCKET).remove([filePath]);
        }
      } catch (storageErr) {
        console.error('Storage 삭제 오류 (계속 진행):', storageErr);
        // Storage 삭제 실패해도 DB는 삭제
      }
    }

    // 관련 데이터 삭제 (순서 중요: 외래키 관계 때문에)
    // 1. 사진 위치 정보 삭제
    const { error: posError } = await supabase
      .from(PHOTO_POSITIONS_TABLE)
      .delete()
      .eq('photo_id', photoId);

    if (posError) {
      console.error('위치 정보 삭제 오류 (계속 진행):', posError);
      // 계속 진행
    }

    // 2. 장식 정보 삭제
    const { error: decorError } = await supabase
      .from(DECORATIONS_TABLE)
      .delete()
      .eq('photo_id', photoId);

    if (decorError) {
      console.error('장식 정보 삭제 오류 (계속 진행):', decorError);
      // 계속 진행
    }

    // 3. 사진 자체 삭제
    const { error: dbError } = await supabase
      .from(PHOTOS_TABLE)
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('사진 삭제 오류:', dbError);
      throw dbError;
    }

    return NextResponse.json({ success: true, message: '사진이 삭제되었습니다' });
  } catch (error) {
    console.error('사진 삭제 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `사진 삭제 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
