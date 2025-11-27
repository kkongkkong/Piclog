import { NextRequest, NextResponse } from 'next/server';
import { supabase, TEXT_ITEMS_TABLE } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/text-items?timeBlockTime=09:00
 * 특정 시간대(TimelineSection)의 텍스트 항목들을 조회합니다.
 *
 * Query params:
 *   timeBlockTime: string (e.g., "09:00")
 *
 * Response: TextItem[]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeBlockTime = searchParams.get('timeBlockTime');

    if (!timeBlockTime) {
      return NextResponse.json(
        { error: 'timeBlockTime 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // 시간대별 텍스트 항목 조회
    const { data, error } = await supabase
      .from(TEXT_ITEMS_TABLE)
      .select('*')
      .eq('time_block_time', timeBlockTime)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('텍스트 항목 조회 오류:', error);
      throw error;
    }

    // 응답 형식을 캐멀케이스로 변환
    const items = (data || []).map((item: any) => ({
      id: item.id,
      timeBlockTime: item.time_block_time,
      content: item.content,
      x: item.x,
      y: item.y,
      fontSize: item.font_size,
      color: item.color,
      fontWeight: item.font_weight,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('텍스트 항목 조회 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `텍스트 항목 조회 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
