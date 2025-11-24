import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';
import { AutoSyncResult } from '@/types';

/**
 * POST /api/photos/auto-sync
 * 갤러리를 스캔하고 새로운 사진을 감지하여 추가합니다.
 * (실제 구현은 앱 레벨에서 백그라운드 작업으로 수행됩니다)
 */
export async function POST(request: NextRequest) {
  try {
    // 현재 시간
    const now = new Date().toISOString();

    // 데이터베이스에서 최근 10개의 사진 조회
    const { data: photos, error } = await supabase
      .from(PHOTOS_TABLE)
      .select('*')
      .order('created_at_db', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase 쿼리 오류:', error);
      throw error;
    }

    // 동기화 결과 생성
    const syncResult: AutoSyncResult = {
      scannedAt: now,
      newPhotos: (photos || []).map((photo) => ({
        id: photo.id,
        url: photo.url,
        createdAt: photo.created_at,
        label: photo.label,
      })),
      skippedCount: 0,
    };

    return NextResponse.json(syncResult);
  } catch (error) {
    console.error('자동 동기화 오류:', error);
    return NextResponse.json(
      { error: '자동 동기화 실패' },
      { status: 500 }
    );
  }
}
