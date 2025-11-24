import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';
import { TimelineData } from '@/types';
import { getHourFromTimestamp, isSameDay, formatTimelineDate } from '@/lib/dates';

/**
 * GET /api/timeline?date=YYYY-MM-DD
 * 특정 날짜의 타임라인 데이터를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: '날짜 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    // Supabase에서 해당 날짜의 사진 조회
    const { data: photos, error } = await supabase
      .from(PHOTOS_TABLE)
      .select('*')
      .gte('created_at', `${date}T00:00:00Z`)
      .lt('created_at', `${date}T23:59:59Z`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase 쿼리 오류:', error);
      throw error;
    }

    // 시간대별로 그룹화
    const timelineMap = new Map<string, any[]>();

    (photos || []).forEach((photo) => {
      const hour = getHourFromTimestamp(photo.created_at);
      if (!timelineMap.has(hour)) {
        timelineMap.set(hour, []);
      }
      timelineMap.get(hour)!.push({
        id: photo.id,
        url: photo.url,
        createdAt: photo.created_at,
        label: photo.label,
      });
    });

    // 시간 순서로 정렬
    const sortedHours = Array.from(timelineMap.keys()).sort();
    const timeline: TimelineData = sortedHours.map((hour) => ({
      time: hour,
      photos: timelineMap.get(hour)!,
    }));

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('타임라인 조회 오류:', error);
    return NextResponse.json(
      { error: '타임라인 조회 실패' },
      { status: 500 }
    );
  }
}
