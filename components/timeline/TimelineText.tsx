'use client';

import { useState, useEffect, useRef } from 'react';
import { TextItem } from '@/types';

interface TimelineTextProps {
  text: TextItem;
  onPositionChange?: (textId: string, x: number, y: number) => Promise<void>;
  onContentChange?: (textId: string, content: string) => Promise<void>;
  onFontSizeChange?: (textId: string, fontSize: number) => Promise<void>;
  onDelete?: (textId: string) => Promise<void>;
  onBlur?: (textId: string, newContent: string) => Promise<void>;
}

/**
 * TimelineText: 타임라인 텍스트 렌더링 + 드래그 + 크기 조절 + 편집 기능
 * - position: absolute (TimelineSection 내부 기준)
 * - 텍스트 클릭 시 인라인 편집 가능
 * - 드래그로 위치 조정 (TimelineSection 범위 제한)
 * - 우측 하단 resize handle로 fontSize 조정 (10~60px)
 * - 호버 시 삭제 버튼 표시
 */
export function TimelineText({
  text,
  onPositionChange,
  onContentChange,
  onFontSizeChange,
  onDelete,
  onBlur,
}: TimelineTextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(text.content);
  const [position, setPosition] = useState({ x: text.x, y: text.y });
  const [fontSize, setFontSize] = useState(text.fontSize);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<number | null>(null);
  const [initialFontSize, setInitialFontSize] = useState<number | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const photosContainerRef = useRef<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // 컴포넌트 마운트 시 부모 엘리먼트 찾기
  useEffect(() => {
    if (textRef.current) {
      sectionRef.current = textRef.current.closest('.timeline-section-row') as HTMLElement;
      photosContainerRef.current = textRef.current.closest('.timeline-photos-container') as HTMLElement;

      if (sectionRef.current && getComputedStyle(sectionRef.current).position === 'static') {
        sectionRef.current.style.position = 'relative';
      }
    }
  }, []);

  // 편집 모드 진입 시 textarea 자동 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 드래그 제약 함수
  const getClampedPosition = (x: number, y: number): { x: number; y: number } => {
    if (!sectionRef.current || !textRef.current || !photosContainerRef.current) {
      return { x, y };
    }

    const sectionRect = sectionRef.current.getBoundingClientRect();
    const containerRect = photosContainerRef.current.getBoundingClientRect();
    const textRect = textRef.current.getBoundingClientRect();

    const textWidth = textRect.width;
    const textHeight = textRect.height;

    const sectionTop = 0;
    const sectionBottom = sectionRect.height;

    // Y축 제약
    let clampedY = y;
    if (y < sectionTop) {
      clampedY = sectionTop;
    } else if (y + textHeight > sectionBottom) {
      clampedY = Math.max(sectionTop, sectionBottom - textHeight);
    }

    // X축 제약
    let clampedX = x;
    const minX = -((containerRect.left - sectionRect.left)) + 16;
    const maxX = (containerRect.right - sectionRect.left) - textWidth - 16;

    if (x < minX) {
      clampedX = minX;
    } else if (x > maxX) {
      clampedX = maxX;
    }

    return { x: clampedX, y: clampedY };
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isResizing) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: position.x, y: position.y });
  };

  // Resize 핸들 마우스 다운
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isDragging) return;

    e.stopPropagation();
    setIsResizing(true);
    setResizeStart(e.clientX);
    setInitialFontSize(fontSize);
  };

  // 드래그 중 처리
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart || !sectionRef.current) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = (initialPos?.x || 0) + deltaX;
      let newY = (initialPos?.y || 0) + deltaY;

      const clamped = getClampedPosition(newX, newY);
      setPosition({ x: clamped.x, y: clamped.y });
    };

    const handleMouseUp = async () => {
      if (!dragStart || !sectionRef.current || !position) {
        setIsDragging(false);
        return;
      }

      const finalPosition = getClampedPosition(position.x, position.y);

      if (onPositionChange) {
        try {
          await onPositionChange(text.id, finalPosition.x, finalPosition.y);
          setPosition(finalPosition);
        } catch (error) {
          console.error('텍스트 위치 저장 실패:', error);
          setPosition(initialPos || { x: 0, y: 0 });
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
  }, [isDragging, dragStart, initialPos, position, text.id, onPositionChange]);

  // Resize 처리
  useEffect(() => {
    if (!isResizing || resizeStart === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizeStart === null || initialFontSize === null) return;

      const deltaX = e.clientX - resizeStart;
      const newFontSize = Math.max(10, initialFontSize + deltaX);

      setFontSize(Math.min(60, newFontSize));
    };

    const handleMouseUp = async () => {
      if (resizeStart === null || !fontSize) {
        setIsResizing(false);
        return;
      }

      const finalFontSize = Math.max(10, Math.min(60, fontSize));

      if (onFontSizeChange) {
        try {
          await onFontSizeChange(text.id, finalFontSize);
          setFontSize(finalFontSize);
        } catch (error) {
          console.error('폰트 크기 저장 실패:', error);
          setFontSize(initialFontSize || text.fontSize);
        }
      }

      setIsResizing(false);
      setResizeStart(null);
      setInitialFontSize(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, initialFontSize, fontSize, text.id, onFontSizeChange]);

  // 텍스트 편집 완료
  const handleBlur = async () => {
    setIsEditing(false);

    if (content !== text.content && onBlur) {
      try {
        await onBlur(text.id, content);
      } catch (error) {
        console.error('텍스트 내용 저장 실패:', error);
        setContent(text.content);
      }
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!confirm('이 텍스트를 삭제하시겠습니까?')) return;

    if (onDelete) {
      try {
        await onDelete(text.id);
      } catch (error) {
        console.error('텍스트 삭제 실패:', error);
      }
    }
  };

  const hasPosition = true; // 텍스트는 항상 absolute

  return (
    <div
      ref={textRef}
      className={`timeline-text group relative ${isDragging ? 'timeline-text-dragging' : 'timeline-text-draggable'}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging || isResizing || isEditing ? 50 : 10,
        cursor: isDragging ? 'grabbing' : isResizing ? 'col-resize' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        // 편집 모드
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsEditing(false);
              setContent(text.content);
            } else if (e.key === 'Enter' && e.ctrlKey) {
              handleBlur();
            }
          }}
          className="timeline-text-input"
          style={{
            fontSize: `${fontSize}px`,
            padding: '8px',
            border: '2px solid #4F46E5',
            borderRadius: '4px',
            backgroundColor: '#fff',
            minWidth: '120px',
            maxWidth: '400px',
            fontFamily: 'inherit',
            resize: 'both',
          }}
        />
      ) : (
        // 표시 모드
        <div
          className="timeline-text-display"
          style={{
            fontSize: `${fontSize}px`,
            color: text.color || '#333',
            fontWeight: (text.fontWeight || 'normal') as 'normal' | 'bold',
            userSelect: 'none',
            cursor: 'grab',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            maxWidth: '400px',
          }}
          onDoubleClick={() => setIsEditing(true)}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      )}

      {/* Resize Handle */}
      {!isEditing && (
        <div
          className="timeline-text-resize-handle"
          onMouseDown={handleResizeMouseDown}
          title="크기 조절"
          style={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '2px',
            cursor: 'col-resize',
            zIndex: 40,
          }}
        />
      )}

      {/* 호버 액션 버튼 */}
      {!isEditing && (
        <div
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary btn-small text-xs px-2 py-1"
            title="편집"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-secondary btn-small text-xs px-2 py-1"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
