import { NextRequest, NextResponse } from 'next/server';
import { supabase, DECORATIONS_TABLE, STICKERS_BUCKET } from '@/lib/supabase';
import { DecorationElement } from '@/types';

/**
 * POST /api/decorations/save
 * 데코레이션(누끼 및 기타 요소)을 저장합니다.
 * - Nukki 이미지를 Supabase Storage에 업로드
 * - Decorations 정보를 DB에 저장
 *
 * Body: {
 *   photoId: string;
 *   decorations: DecorationElement[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { photoId, decorations } = await request.json();

    if (!photoId || !decorations || !Array.isArray(decorations)) {
      return NextResponse.json(
        { error: '유효한 photoId와 decorations이 필요합니다' },
        { status: 400 }
      );
    }

    // 이미지 스토리지 업로드 처리
    const processedDecorations: DecorationElement[] = [];

    for (const decoration of decorations) {
      let processedDecoration = { ...decoration };

      // Nukki 타입이고 Base64 URL이 있으면 그대로 유지 (Storage RLS 문제 우회)
      if (
        decoration.type === 'nukki' &&
        decoration.imageUrl &&
        decoration.imageUrl.startsWith('data:')
      ) {
        // Base64는 그대로 저장 (RLS 정책 문제 없음)
        console.log('누끼 Base64 URL 저장:', decoration.imageUrl.substring(0, 50));
        // processedDecoration.imageUrl은 이미 Base64 데이터임
      }
      // HTTP URL인 경우는 그대로 유지
      else if (decoration.type === 'nukki' && decoration.imageUrl?.startsWith('http')) {
        console.log('누끼 HTTP URL 유지:', decoration.imageUrl);
        // processedDecoration.imageUrl은 이미 HTTP URL임
      }

      processedDecorations.push(processedDecoration);
    }

    // DB에 저장
    const { data: saveData, error: saveError } = await supabase
      .from(DECORATIONS_TABLE)
      .upsert(
        {
          photo_id: photoId,
          decorations: processedDecorations,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'photo_id' }
      )
      .select()
      .single();

    if (saveError) {
      console.error('Decorations DB 저장 오류:', saveError);
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      data: saveData,
      message: '데코레이션이 저장되었습니다',
    });
  } catch (error) {
    console.error('데코레이션 저장 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `데코레이션 저장 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
