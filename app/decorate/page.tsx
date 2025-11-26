'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhotoItem, DecorationElement } from '@/types';
import { DecorateContainer } from '@/components';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';
import Link from 'next/link';

/**
 * Decorate Page: /decorate?photoId=XXX
 * 선택한 사진을 꾸미는 페이지
 */
export default function DecoratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photoId = searchParams.get('photoId');

  const [photo, setPhoto] = useState<PhotoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // photoId 기반으로 사진 로드
  useEffect(() => {
    if (!photoId) {
      setError('사진 ID가 없습니다');
      setLoading(false);
      return;
    }

    const loadPhoto = async () => {
      try {
        setLoading(true);
        setError(null);

        // Supabase에서 실제 사진 데이터 조회
        const { data: photoData, error: supabaseError } = await supabase
          .from(PHOTOS_TABLE)
          .select('*')
          .eq('id', photoId)
          .single();

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!photoData) {
          throw new Error('사진을 찾을 수 없습니다');
        }

        const photo: PhotoItem = {
          id: photoData.id,
          url: photoData.url,
          createdAt: photoData.created_at,
          label: photoData.label,
        };

        setPhoto(photo);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '사진 로드 실패';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [photoId]);

  const handleSaveDecorations = async (decorations: DecorationElement[]) => {
    // Supabase에 저장하는 로직은 별도의 Hook이나 API를 통해 처리
    try {
      const response = await fetch('/api/decorations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: photo?.id,
          decorations,
        }),
      });

      if (!response.ok) {
        throw new Error('저장 실패');
      }

      // 저장 완료 후 타임라인으로 돌아가기
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-red-600">{error || '사진을 불러올 수 없습니다'}</div>
        <Link href="/" className="btn btn-primary">
          ← 타임라인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 네비게이션 */}
      <div className="flex items-center gap-4">
        <Link href="/" className="btn btn-secondary">
          ← 돌아가기
        </Link>
      </div>

      {/* Decorate Container */}
      <DecorateContainer
        photo={photo}
        onSaveDecorations={handleSaveDecorations}
      />
    </div>
  );
}
