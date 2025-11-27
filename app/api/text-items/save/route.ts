import { NextRequest, NextResponse } from 'next/server';
import { supabase, TEXT_ITEMS_TABLE } from '@/lib/supabase';

/**
 * POST /api/text-items/save
 * 새로운 텍스트를 생성하거나 기존 텍스트를 업데이트합니다.
 *
 * Body: {
 *   id?: string; // 있으면 업데이트, 없으면 생성
 *   timeBlockTime: string; // e.g., "09:00"
 *   content: string;
 *   x: number;
 *   y: number;
 *   fontSize: number;
 *   color?: string;
 *   fontWeight?: 'normal' | 'bold';
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { id, timeBlockTime, content, x, y, fontSize, color = '#333333', fontWeight = 'normal' } =
      await request.json();

    if (!timeBlockTime || !content || x === undefined || y === undefined || fontSize === undefined) {
      return NextResponse.json(
        { error: 'timeBlockTime, content, x, y, fontSize가 필요합니다' },
        { status: 400 }
      );
    }

    // fontSize 범위 제약 (10~60px)
    const clampedFontSize = Math.max(10, Math.min(60, fontSize));

    const insertData: any = {
      time_block_time: timeBlockTime,
      content,
      x: parseInt(String(x)),
      y: parseInt(String(y)),
      font_size: clampedFontSize,
      color,
      font_weight: fontWeight,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (id) {
      // 업데이트
      result = await supabase
        .from(TEXT_ITEMS_TABLE)
        .update(insertData)
        .eq('id', id)
        .select()
        .single();
    } else {
      // 생성
      result = await supabase
        .from(TEXT_ITEMS_TABLE)
        .insert(insertData)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('텍스트 저장 오류:', error);
      throw error;
    }

    // 응답 형식을 캐멀케이스로 변환
    const item = {
      id: data.id,
      timeBlockTime: data.time_block_time,
      content: data.content,
      x: data.x,
      y: data.y,
      fontSize: data.font_size,
      color: data.color,
      fontWeight: data.font_weight,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: item,
      message: id ? '텍스트가 업데이트되었습니다' : '텍스트가 생성되었습니다',
    });
  } catch (error) {
    console.error('텍스트 저장 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `텍스트 저장 실패: ${errorMsg}` },
      { status: 500 }
    );
  }
}
