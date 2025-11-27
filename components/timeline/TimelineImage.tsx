'use client';

import { useState, useEffect, useRef } from 'react';
import { PhotoItem } from '@/types';

interface TimelineImageProps {
  photo: PhotoItem;
  timeBlockTime: string; // e.g., "09:00"
  onDecorate?: (photoId: string) => void;
  onRemove?: (photoId: string, url: string) => Promise<boolean>;
  onPositionChange?: (photoId: string, x: number, y: number) => Promise<void>;
  onResizeEnd?: (photoId: string, width: number, timeBlockTime: string, x: number, y: number) => Promise<void>;
  index?: number;
}

/**
 * TimelineImage: 투명 배경의 누끼 이미지 렌더링 + 드래그 + 리사이즈 기능
 * - position: absolute (드래그 모드) 또는 relative (기본)
 * - TimelineSection 내부에서만 드래그 가능
 * - 우측 하단 resize handle로 너비 조정 가능
 * - 저장된 위치와 크기는 Supabase에 persisted
 * - 같은 시간대 사진끼리 약하게 겹칠 수 있음
 * - 카드 박스 없음 (background: transparent)
 */
export function TimelineImage({
  photo,
  timeBlockTime,
  onDecorate,
  onRemove,
  onPositionChange,
  onResizeEnd,
  index = 0,
}: TimelineImageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // 저장된 위치와 크기 로드
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const response = await fetch(
          `/api/photos/positions/get?photoId=${photo.id}&time=${encodeURIComponent(timeBlockTime)}`
        );
        if (!response.ok) return;

        const data = await response.json();
        if (data?.x !== undefined && data?.y !== undefined) {
          setPosition({ x: data.x, y: data.y });
        }
        if (data?.width !== undefined && data.width !== null) {
          setWidth(data.width);
        }
      } catch (error) {
        console.error('사진 위치 로드 실패:', error);
      }
    };

    loadPosition();
  }, [photo.id, timeBlockTime]);

  // TimelineSection 찾기 (드래그 범위 제한용)
  useEffect(() => {
    if (imgRef.current) {
      sectionRef.current = imgRef.current.closest('.timeline-section-row') as HTMLElement;
      if (sectionRef.current && sectionRef.current.style.position !== 'relative') {
        sectionRef.current.style.position = 'relative';
      }
    }
  }, []);

  const handleRemove = async () => {
    if (!onRemove) return;
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await onRemove(photo.id, photo.url);
    } finally {
      setIsDeleting(false);
    }
  };

  // 드래그 시작 (이미지 위에서만, resize 중에는 제외)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizing) return; // resize 중에는 drag 시작 안 함
    if (!(e.target as HTMLElement).closest('img')) return; // 이미지 위에서만 드래그

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos(position || { x: 0, y: 0 });
  };

  // Resize Handle 마우스 다운 (드래그 중에는 제외)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isDragging) return; // drag 중에는 resize 시작 안 함

    e.stopPropagation(); // 드래그 이벤트 전파 방지
    setIsResizing(true);
    setResizeStart(e.clientX);
    setInitialWidth(width || 200); // 기본값 200px
  };

  // 드래그 중 (document 레벨에서 추적)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart || !sectionRef.current) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newX = (initialPos?.x || 0) + deltaX;
      const newY = (initialPos?.y || 0) + deltaY;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!dragStart || !sectionRef.current || !position) {
        setIsDragging(false);
        return;
      }

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const imgRect = imgRef.current?.getBoundingClientRect();

      if (!imgRect) {
        setIsDragging(false);
        return;
      }

      // 범위 체크: 이미지가 TimelineSection 내부에 있는지 확인
      const isWithinBounds =
        imgRect.left >= sectionRect.left &&
        imgRect.right <= sectionRect.right &&
        imgRect.top >= sectionRect.top &&
        imgRect.bottom <= sectionRect.bottom;

      if (!isWithinBounds) {
        // 범위 밖: 원위치로 복구
        setPosition(initialPos || { x: 0, y: 0 });
      } else {
        // 범위 내: 위치 저장
        if (onPositionChange) {
          try {
            await onPositionChange(photo.id, position.x, position.y);
          } catch (error) {
            console.error('위치 저장 실패:', error);
            setPosition(initialPos || { x: 0, y: 0 });
          }
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setInitialPos(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos, position, photo.id, onPositionChange]);

  // Resize 중 (document 레벨에서 추적)
  useEffect(() => {
    if (!isResizing || resizeStart === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizeStart === null || initialWidth === null) return;

      const deltaX = e.clientX - resizeStart;
      const newWidth = Math.max(50, initialWidth + deltaX); // 최소 50px

      setWidth(newWidth);
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (resizeStart === null || !width) {
        setIsResizing(false);
        return;
      }

      // Resize 완료: 너비 저장
      if (onResizeEnd) {
        try {
          // position과 width를 함께 저장 (현재 x, y가 없으면 0 사용)
          await onResizeEnd(photo.id, width, timeBlockTime, position?.x || 0, position?.y || 0);
        } catch (error) {
          console.error('크기 저장 실패:', error);
          setWidth(initialWidth); // 실패 시 원래 크기로 복구
        }
      }

      setIsResizing(false);
      setResizeStart(null);
      setInitialWidth(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, initialWidth, width, photo.id, onResizeEnd]);

  // 기본 스타일: position이 있으면 absolute, 없으면 relative
  const hasPosition = position !== null;
  const defaultMarginTop = !hasPosition && index > 0 ? -15 : 0;
  const defaultMarginLeft = !hasPosition ? (index % 2) * 10 : 0;

  return (
    <div
      ref={imgRef}
      className={`timeline-image group relative ${isDragging ? 'timeline-image-dragging' : 'timeline-image-draggable'}`}
      style={{
        position: hasPosition ? 'absolute' : 'relative',
        display: 'block',
        left: hasPosition ? `${position.x}px` : 'auto',
        top: hasPosition ? `${position.y}px` : 'auto',
        width: width ? `${width}px` : 'auto',
        marginTop: `${defaultMarginTop}px`,
        marginLeft: `${defaultMarginLeft}px`,
        zIndex: isDragging || isResizing ? 50 : 10,
        cursor: isDragging ? 'grabbing' : isResizing ? 'col-resize' : hasPosition ? 'grab' : 'pointer',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 투명 배경 이미지 (카드 박스 없음) */}
      <div
        className="inline-block drop-shadow-md hover:drop-shadow-xl transition-shadow cursor-pointer hover:scale-105 transition-transform"
        style={{
          background: 'transparent',
          width: width ? '100%' : 'auto',
        }}
      >
        <img
          src={photo.url}
          alt={photo.label || '사진'}
          className="h-auto object-contain"
          style={{
            width: width ? '100%' : 'auto',
            maxWidth: width ? 'none' : '320px',
            maxHeight: width ? '600px' : '280px',
          }}
        />
      </div>

      {/* Resize Handle (absolute 모드일 때만 표시) */}
      {hasPosition && (
        <div
          className="timeline-image-resize-handle"
          onMouseDown={handleResizeMouseDown}
          title="크기 조절"
        />
      )}

      {/* 호버 시 액션 버튼 */}
      <div
        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20 ${
          isDeleting ? 'opacity-50' : ''
        }`}
      >
        {onDecorate && (
          <button
            onClick={() => onDecorate(photo.id)}
            disabled={isDeleting}
            className="btn btn-primary btn-small disabled:opacity-50"
            title="꾸미기"
          >
            ✨
          </button>
        )}
        {onRemove && (
          <button
            onClick={handleRemove}
            disabled={isDeleting}
            className="btn btn-secondary btn-small disabled:opacity-50"
            title="삭제"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>

      {/* 라벨 (선택사항) */}
      {photo.label && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-[150px] truncate pointer-events-none">
          {photo.label}
        </div>
      )}
    </div>
  );
}
