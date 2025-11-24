import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE, PHOTOS_BUCKET } from '@/lib/supabase';
import { extractPhotoTimestampFromFilename } from '@/lib/dates';
import { PhotoItem } from '@/types';

const MAX_PHOTOS_PER_HOUR = 3;

/**
 * POST /api/photos/upload
 * 사진을 업로드하고 Supabase에 저장합니다.
 * - 동일한 시간에 최대 3장까지만 저장 가능
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const label = formData.get('label') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const buffer = await file.arrayBuffer();

    // 🔥 uuidv4 → crypto.randomUUID()로 변경 (타입 문제 0%)
    const fileName = `${crypto.randomUUID()}-${file.name}`;

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(`photos/${fileName}`, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage 업로드 오류:', uploadError);
      throw uploadError;
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(`photos/${fileName}`);

    // 파일명에서 촬영 시간 추출
    let createdAt = extractPhotoTimestampFromFilename(file.name);

    // 파일명에 시간 정보가 없으면 업로드 시간 사용
    if (!createdAt) {
      createdAt = new Date().toISOString();
    }

    // 동일한 시간대 사진 수 확인
    const createdDate = new Date(createdAt);
    const hourStart = new Date(createdDate);
    hourStart.setMinutes(0, 0, 0);

    const hourEnd = new Date(createdDate);
    hourEnd.setMinutes(59, 59, 999);

    const { data: existingPhotos, error: queryError } = await supabase
      .from(PHOTOS_TABLE)
      .select('id')
      .gte('created_at', hourStart.toISOString())
      .lte('created_at', hourEnd.toISOString());

    if (queryError) {
      console.error('기존 사진 조회 오류:', queryError);
      throw queryError;
    }

    if ((existingPhotos?.length || 0) >= MAX_PHOTOS_PER_HOUR) {
      return NextResponse.json(
        {
          error: `이 시간대(${hourStart.getHours().toString().padStart(2, '0')}:00)에는 이미 최대 개수(${MAX_PHOTOS_PER_HOUR}장)의 사진이 등록되어 있습니다.`,
        },
        { status: 400 }
      );
    }

    // DB에 메타데이터 저장
    const { data: photoData, error: dbError } = await supabase
      .from(PHOTOS_TABLE)
      .insert([
        {
          url: publicUrl,
          created_at: createdAt,
          label: label || null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('DB 저장 오류:', dbError);
      throw dbError;
    }

    const photoItem: PhotoItem = {
      id: photoData.id,
      url: photoData.url,
      createdAt: photoData.created_at,
      label: photoData.label,
    };

    return NextResponse.json(photoItem);
  } catch (error) {
    console.error('사진 업로드 오류:', error);
    return NextResponse.json({ error: '사진 업로드 실패' }, { status: 500 });
  }
}
