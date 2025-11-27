'use client';

import { TimelineData } from '@/types';
import { TimelineSection } from './TimelineSection';
import { useCallback } from 'react';

interface TimelineColumnProps {
  data: TimelineData;
  onSelectPhoto?: (photoId: string) => void;
  onRemovePhoto?: (photoId: string, url: string) => Promise<boolean>;
  onRemoveComplete?: () => void;
  onDecorate?: (photoId: string) => void;
  onPhotoResizeEnd?: (photoId: string, width: number, timeBlockTime: string, x: number, y: number) => Promise<void>;
  selectedPhotos?: Set<string>;
  deleting?: boolean;
}

/**
 * TimelineColumn: 전체 타임라인 (TimelineSection들 관리)
 * - 각 TimelineSection은 [시간 | 노란 선 | 사진들] 구조를 자체 관리
 * - 노란 선은 각 섹션마다 독립적으로 끊어짐
 * - 사진 위치 변경 시 API 호출 처리
 * - TimelineSection들을 순회하며 렌더링
 */
export function TimelineColumn({
  data,
  onSelectPhoto,
  onRemovePhoto,
  onRemoveComplete,
  onDecorate,
  onPhotoResizeEnd,
  selectedPhotos = new Set(),
  deleting = false,
}: TimelineColumnProps) {
  // 사진 위치 변경 핸들러: API에 저장
  const handlePhotoPositionChange = useCallback(
    async (photoId: string, x: number, y: number) => {
      // 현재 블록의 시간 찾기 (timeBlockTime은 TimelineImage에서 전달받음)
      const block = data.find((b) => b.photos.some((p) => p.id === photoId));
      if (!block) return;

      try {
        const response = await fetch('/api/photos/positions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId,
            timeBlockTime: block.time,
            x,
            y,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '위치 저장 실패');
        }
      } catch (error) {
        console.error('사진 위치 저장 오류:', error);
        throw error;
      }
    },
    [data]
  );

  // 사진 크기 변경 핸들러: API에 저장
  const handlePhotoResizeEnd = useCallback(
    async (photoId: string, width: number, timeBlockTime: string, x: number, y: number) => {
      try {
        const response = await fetch('/api/photos/positions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId,
            timeBlockTime,
            x,
            y,
            width,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '크기 저장 실패');
        }
      } catch (error) {
        console.error('사진 크기 저장 오류:', error);
        throw error;
      }
    },
    []
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-center">
          이 날짜에 기록된 사진이 없습니다.
          <br />
          사진을 업로드해보세요! 📸
        </p>
      </div>
    );
  }

  return (
    <div className="timeline-column">
      {/* TimelineSection들: 각각이 [time | line | photos] 구조를 가짐 */}
      {data.map((block) => (
        <TimelineSection
          key={block.time}
          block={block}
          onSelectPhoto={onSelectPhoto}
          onRemovePhoto={onRemovePhoto}
          onRemoveComplete={onRemoveComplete}
          onDecorate={onDecorate}
          onPhotoPositionChange={handlePhotoPositionChange}
          onPhotoResizeEnd={onPhotoResizeEnd || handlePhotoResizeEnd}
          selectedPhotos={selectedPhotos}
          deleting={deleting}
        />
      ))}
    </div>
  );
}
