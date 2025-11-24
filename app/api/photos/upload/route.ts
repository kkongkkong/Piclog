import { NextRequest, NextResponse } from 'next/server';
import { supabase, PHOTOS_TABLE, PHOTOS_BUCKET } from '@/lib/supabase';
import { extractPhotoTimestampFromFilename } from '@/lib/dates';
import { PhotoItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
    const fileName = `${uuidv4()}-${file.name}`;

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(`photos/${fileName}`, buffer, {
        contentType: file.type,
        upsert: true, // 덮어쓰기 허용
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
    // 지원 형식: 20251124_105832.jpg, IMG_20251124_105832.jpg 등
    let createdAt = extractPhotoTimestampFromFilename(file.name);

    // 파일명에 시간 정보가 없으면 업로드 시간 사용
    if (!createdAt) {
      createdAt = new Date().toISOString();
    }

    // 동일한 시간대의 사진 수 확인
    const createdDate = new Date(createdAt);
    const hourStart = new Date(createdDate);
    hourStart.setMinutes(0, 0, 0); // 시간의 시작(00분 00초)

    const hourEnd = new Date(createdDate);
    hourEnd.setMinutes(59, 59, 999); // 시간의 끝(59분 59초)

    const { data: existingPhotos, error: queryError } = await supabase
      .from(PHOTOS_TABLE)
      .select('id')
      .gte('created_at', hourStart.toISOString())
      .lte('created_at', hourEnd.toISOString());

    if (queryError) {
      console.error('기존 사진 조회 오류:', queryError);
      throw queryError;
    }

    // 동일한 시간에 이미 3장 이상 있으면 거부
    if ((existingPhotos?.length || 0) >= MAX_PHOTOS_PER_HOUR) {
      return NextResponse.json(
        {
          error: `이 시간대(${hourStart.getHours().toString().padStart(2, '0')}:00)에는 이미 최대 개수(${MAX_PHOTOS_PER_HOUR}장)의 사진이 등록되어 있습니다. 다른 시간대의 사진을 업로드해주세요.`,
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
    return NextResponse.json(
      { error: '사진 업로드 실패' },
      { status: 500 }
    );
  }
}
