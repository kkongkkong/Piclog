import { NextRequest, NextResponse } from 'next/server';
import { supabase, TEXT_ITEMS_TABLE } from '@/lib/supabase';

/**
 * DELETE /api/text-items?id=xxx
 * 텍스트를 삭제합니다.
 *
 * Query params:
 *   id: string (텍스트 ID)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // 텍스트 삭제
    const { error } = await supabase
      .from(TEXT_ITEMS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('텍스트 삭제 오류:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '텍스트가 삭제되었습니다',
    });
  } catch (error) {
    console.error('텍스트 삭제 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `텍스트 삭제 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
