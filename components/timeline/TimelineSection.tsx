'use client';

import { TimelineBlock } from '@/types';
import { TimelineImage } from './TimelineImage';

interface TimelineSectionProps {
  block: TimelineBlock;
  onSelectPhoto?: (photoId: string) => void;
  onRemovePhoto?: (photoId: string, url: string) => Promise<boolean>;
  onRemoveComplete?: () => void;
  onDecorate?: (photoId: string) => void;
  onPhotoPositionChange?: (photoId: string, x: number, y: number) => Promise<void>;
  onPhotoResizeEnd?: (photoId: string, width: number, timeBlockTime: string, x: number, y: number) => Promise<void>;
  selectedPhotos?: Set<string>;
  deleting?: boolean;
}

/**
 * TimelineSection: 시간대별 독립 컨테이너 with [Time | Yellow Line | Photos]
 * - TimeColumn (시간 라벨) | YellowLine (해당 섹션만) | PhotosContainer (사진들)
 * - 각 섹션의 노란 선 높이는 섹션 콘텐츠 높이에 자동으로 맞춰짐
 * - 사진들은 드래그 가능 (TimelineSection 내부로만 제한)
 * - 다른 시간대 사진과는 절대 겹치지 않음 (컨테이너 분리)
 */
export function TimelineSection({
  block,
  onSelectPhoto,
  onRemovePhoto,
  onRemoveComplete,
  onDecorate,
  onPhotoPositionChange,
  onPhotoResizeEnd,
  selectedPhotos = new Set(),
  deleting = false,
}: TimelineSectionProps) {
  return (
    <div className="timeline-section-row">
      {/* 왼쪽: 시간 라벨 */}
      <div className="timeline-section-time">
        {block.time}
      </div>

      {/* 중앙: 해당 섹션 노란 선 (height는 콘텐츠 높이에 자동으로 맞춰짐) */}
      <div className="timeline-section-line" />

      {/* 구분선: 시간 텍스트와 사진 영역 사이 */}
      <div className="timeline-section-divider" />

      {/* 오른쪽: 같은 시간대의 사진들 (드래그 가능, 범위 제한, 크기 조절 가능) */}
      <div className="timeline-photos-container">
        {block.photos.map((photo, index) => (
          <TimelineImage
            key={photo.id}
            photo={photo}
            timeBlockTime={block.time}
            onDecorate={onDecorate}
            onRemove={onRemovePhoto}
            onPositionChange={onPhotoPositionChange}
            onResizeEnd={onPhotoResizeEnd}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
