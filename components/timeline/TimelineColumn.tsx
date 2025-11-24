'use client';

import { TimelineData } from '@/types';
import { TimelineSection } from './TimelineSection';

interface TimelineColumnProps {
  data: TimelineData;
  onSelectPhoto?: (photoId: string) => void;
  onRemovePhoto?: (photoId: string, url: string) => void;
  onRemoveComplete?: () => void;
  selectedPhotos?: Set<string>;
  deleting?: boolean;
}

/**
 * TimelineColumn: 전체 타임라인 열
 * - 모든 시간대의 섹션을 표시
 */
export function TimelineColumn({
  data,
  onSelectPhoto,
  onRemovePhoto,
  onRemoveComplete,
  selectedPhotos = new Set(),
  deleting = false,
}: TimelineColumnProps) {
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
      {data.map((block) => (
        <TimelineSection
          key={block.time}
          block={block}
          onSelectPhoto={onSelectPhoto}
          onRemovePhoto={onRemovePhoto}
          onRemoveComplete={onRemoveComplete}
          selectedPhotos={selectedPhotos}
          deleting={deleting}
        />
      ))}
    </div>
  );
}
