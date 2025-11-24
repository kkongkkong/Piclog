'use client';

import { TimelineBlock } from '@/types';
import { PhotoCard } from './PhotoCard';

interface TimelineSectionProps {
  block: TimelineBlock;
  onSelectPhoto?: (photoId: string) => void;
  onRemovePhoto?: (photoId: string, url: string) => void;
  onRemoveComplete?: () => void;
  selectedPhotos?: Set<string>;
  deleting?: boolean;
}

/**
 * TimelineSection: 시간대별 섹션
 * - 시간 라벨
 * - 해당 시간대의 사진 카드들
 */
export function TimelineSection({
  block,
  onSelectPhoto,
  onRemovePhoto,
  onRemoveComplete,
  selectedPhotos = new Set(),
  deleting = false,
}: TimelineSectionProps) {
  return (
    <div className="time-block">
      <div className="time-label sticky top-0 bg-white/90 backdrop-blur py-2">
        {block.time}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {block.photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onSelect={onSelectPhoto}
            onRemove={onRemovePhoto}
            onRemoveComplete={onRemoveComplete}
            isSelected={selectedPhotos.has(photo.id)}
            deleting={deleting}
          />
        ))}
      </div>
    </div>
  );
}
