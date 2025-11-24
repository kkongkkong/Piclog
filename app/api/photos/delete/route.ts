import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE, PHOTOS_BUCKET } from '@/lib/supabase';

/**
 * DELETE /api/photos/delete
 * 사진을 삭제합니다 (DB와 Storage에서 모두 삭제)
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

    // DB에서 레코드 삭제
    const { error: dbError } = await supabase
      .from(PHOTOS_TABLE)
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('DB 삭제 오류:', dbError);
      throw dbError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('사진 삭제 오류:', error);
    return NextResponse.json(
      { error: '사진 삭제 실패' },
      { status: 500 }
    );
  }
}
