'use client';

import { useState } from 'react';
import { PhotoItem } from '@/types';
import Image from 'next/image';

interface PhotoCardProps {
  photo: PhotoItem;
  onSelect?: (photoId: string) => void;
  onRemove?: (photoId: string, url: string) => void;
  onRemoveComplete?: () => void;
  isSelected?: boolean;
  deleting?: boolean;
}

/**
 * PhotoCard: 개별 사진 카드
 * - 이미지 표시
 * - 라벨(메모) 표시
 * - 선택/제외 기능
 * - 삭제 기능
 */
export function PhotoCard({
  photo,
  onSelect,
  onRemove,
  onRemoveComplete,
  isSelected = false,
  deleting = false,
}: PhotoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onRemove) return;
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await onRemove(photo.id, photo.url);
      onRemoveComplete?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`photo-card relative group ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDeleting || deleting ? 'opacity-50' : ''}`}
    >
      <div className="relative w-full h-48">
        <Image
          src={photo.url}
          alt={photo.label || '사진'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="photo-card-info">
        {photo.label && <p className="photo-label">{photo.label}</p>}
      </div>

      {/* 선택/삭제 버튼 (hover 시 표시) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {onSelect && (
          <button
            onClick={() => onSelect(photo.id)}
            disabled={isDeleting || deleting}
            className="btn btn-primary btn-small disabled:opacity-50"
            title="선택"
          >
            {isSelected ? '✓' : '+'}
          </button>
        )}
        {onRemove && (
          <button
            onClick={handleDelete}
            disabled={isDeleting || deleting}
            className="btn btn-secondary btn-small disabled:opacity-50"
            title="삭제"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>
    </div>
  );
}
