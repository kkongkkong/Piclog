'use client';

import { useState } from 'react';
import { TimelineData } from '@/types';
import { TimelineColumn } from './TimelineColumn';

interface TimelineContainerProps {
  data: TimelineData;
  loading?: boolean;
  error?: string | null;
  onPhotoDelete?: () => void;
  onDeletePhoto?: (photoId: string, url: string) => Promise<boolean>;
}

/**
 * TimelineContainer: 기본뷰 전체 컨테이너
 * - 사진 선택/제외 상태 관리
 * - 타임라인 데이터 렌더링
 * - 사진 삭제 처리
 */
export function TimelineContainer({
  data,
  loading = false,
  error = null,
  onPhotoDelete,
  onDeletePhoto,
}: TimelineContainerProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleRemovePhoto = async (photoId: string, url: string) => {
    if (!onDeletePhoto) return;

    setDeleting(true);
    try {
      const success = await onDeletePhoto(photoId, url);
      if (success) {
        setSelectedPhotos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(photoId);
          return newSet;
        });
        onPhotoDelete?.();
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="timeline-container flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-container flex items-center justify-center py-12">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <TimelineColumn
        data={data}
        onSelectPhoto={handleSelectPhoto}
        onRemovePhoto={handleRemovePhoto}
        onRemoveComplete={onPhotoDelete}
        selectedPhotos={selectedPhotos}
        deleting={deleting}
      />
    </div>
  );
}
