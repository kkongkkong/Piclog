'use client';

import { TimelineBlock } from '@/types';
import { ThumbnailMini } from './ThumbnailMini';
import { MoreIndicator } from './MoreIndicator';

interface CompactTimelineRowProps {
  block: TimelineBlock;
}

/**
 * CompactTimelineRow: 요약뷰 한 줄
 * - 시간 라벨
 * - 최대 3개의 썸네일
 * - +N 인디케이터
 * - 텍스트 라벨 (10~20자)
 */
export function CompactTimelineRow({ block }: CompactTimelineRowProps) {
  const { time, photos } = block;
  const maxThumbnails = 3;
  const thumbnailPhotos = photos.slice(0, maxThumbnails);
  const extraCount = Math.max(0, photos.length - maxThumbnails);

  // 첫 번째 사진의 라벨 (없으면 기본 텍스트)
  const label = photos[0]?.label || `${photos.length}장의 사진`;
  const displayLabel = label.length > 20 ? label.substring(0, 20) + '...' : label;

  return (
    <div className="compact-row">
      <div className="compact-time">{time}</div>

      <div className="thumbnail-container">
        {thumbnailPhotos.map((photo) => (
          <ThumbnailMini key={photo.id} url={photo.url} alt={photo.label} />
        ))}
        {extraCount > 0 && <MoreIndicator count={extraCount} />}
      </div>

      <span className="text-sm text-gray-600 flex-shrink-0 ml-auto">
        {displayLabel}
      </span>
    </div>
  );
}
