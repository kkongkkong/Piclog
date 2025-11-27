'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhotoItem, DecorationElement } from '@/types';
import { DecorateContainer } from '@/components';
import { supabase, PHOTOS_TABLE } from '@/lib/supabase';
import Link from 'next/link';

/**
 * DecoratePageContent: useSearchParams() 사용하는 실제 컨텐츠
 */
export default function DecoratePageContent() {
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
          console.error('Supabase 쿼리 에러:', {
            code: supabaseError.code,
            message: supabaseError.message,
            status: (supabaseError as any).status,
            details: (supabaseError as any).details,
          });
          throw new Error(`사진 로드 실패: ${supabaseError.message}`);
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
        console.error('사진 로드 중 오류:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [photoId]);

  const handleSaveDecorations = async (decorations: DecorationElement[]) => {
    try {
      // 누끼 decoration과 텍스트 찾기
      const nukkiDecoration = decorations.find((d) => d.type === 'nukki');
      const textDecorations = decorations.filter((d) => d.type === 'text');

      // 누끼가 있으면 사진 URL을 업데이트
      if (nukkiDecoration && nukkiDecoration.imageUrl && photo) {
        console.log('누끼 저장 시작:', nukkiDecoration.imageUrl.substring(0, 50));

        // 누끼와 텍스트를 함께 저장
        const decorationsToSave = [nukkiDecoration, ...textDecorations];
        const response = await fetch('/api/decorations/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoId: photo?.id,
            decorations: decorationsToSave,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Decoration 저장 실패: ${errorData.error}`);
        }

        const result = await response.json();
        console.log('Decoration 저장 결과:', result);

        const savedDecorations = result.data?.decorations || [];
        const savedNukkiDecoration = savedDecorations.find(
          (d: DecorationElement) => d.type === 'nukki'
        );

        console.log('저장된 누끼 데이터:', savedNukkiDecoration);

        // 사진의 URL을 누끼 이미지로 업데이트
        if (savedNukkiDecoration && savedNukkiDecoration.imageUrl) {
          console.log('사진 URL 업데이트 시작:', savedNukkiDecoration.imageUrl.substring(0, 50));

          const updateResponse = await fetch('/api/photos/update-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              photoId: photo.id,
              imageUrl: savedNukkiDecoration.imageUrl,
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('사진 업데이트 실패:', errorData);
            throw new Error(`사진 업데이트 실패: ${errorData.error}`);
          }

          console.log('사진 URL 업데이트 완료');

          // 누끼 완료 후 누끼 decoration 데이터만 삭제 (텍스트는 유지)
          if (textDecorations.length === 0) {
            const deleteResponse = await fetch('/api/decorations/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                photoId: photo.id,
              }),
            });
            console.log('Decoration 삭제:', deleteResponse.ok);
          }
        } else {
          throw new Error('저장된 누끼 데이터가 없습니다');
        }
      } else {
        // 누끼가 없으면 모든 decoration들을 저장 (텍스트만 있는 경우)
        if (decorations.length > 0) {
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
            const errorData = await response.json();
            throw new Error(`저장 실패: ${errorData.error}`);
          }
        }
      }

      // 저장 완료 후 타임라인으로 돌아가기
      console.log('저장 완료, 타임라인으로 이동');
      router.push('/');
    } catch (error) {
      console.error('저장 중 오류:', error);
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
