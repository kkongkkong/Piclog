'use client';

import { useState, useEffect } from 'react';
import { TimelineBlock, TextItem } from '@/types';
import { TimelineImage } from './TimelineImage';
import { TimelineText } from './TimelineText';

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
 * TimelineSection: 시간대별 독립 컨테이너 with [Time | Yellow Line | Photos & Texts]
 * - TimeColumn (시간 라벨) | YellowLine (해당 섹션만) | PhotosContainer (사진들 + 텍스트)
 * - 각 섹션의 노란 선 높이는 섹션 콘텐츠 높이에 자동으로 맞춰짐
 * - 사진과 텍스트는 모두 드래그 가능 (TimelineSection 내부로만 제한)
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
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [loadingTexts, setLoadingTexts] = useState(false);

  // 텍스트 항목 로드
  useEffect(() => {
    const loadTextItems = async () => {
      try {
        setLoadingTexts(true);
        const response = await fetch(`/api/text-items?timeBlockTime=${encodeURIComponent(block.time)}`);
        if (!response.ok) throw new Error('텍스트 로드 실패');
        const data = await response.json();
        setTextItems(data || []);
      } catch (error) {
        console.error('텍스트 항목 로드 실패:', error);
      } finally {
        setLoadingTexts(false);
      }
    };

    loadTextItems();
  }, [block.time]);

  // 텍스트 위치 변경
  const handleTextPositionChange = async (textId: string, x: number, y: number) => {
    try {
      const response = await fetch('/api/text-items/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: textId,
          timeBlockTime: block.time,
          x,
          y,
          content: textItems.find((t) => t.id === textId)?.content || '',
          fontSize: textItems.find((t) => t.id === textId)?.fontSize || 16,
        }),
      });

      if (!response.ok) throw new Error('위치 저장 실패');
    } catch (error) {
      console.error('텍스트 위치 저장 오류:', error);
      throw error;
    }
  };

  // 텍스트 내용 변경
  const handleTextContentChange = async (textId: string, newContent: string) => {
    try {
      const textItem = textItems.find((t) => t.id === textId);
      if (!textItem) return;

      const response = await fetch('/api/text-items/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: textId,
          timeBlockTime: block.time,
          content: newContent,
          x: textItem.x,
          y: textItem.y,
          fontSize: textItem.fontSize,
        }),
      });

      if (!response.ok) throw new Error('내용 저장 실패');

      // 로컬 상태 업데이트
      setTextItems(textItems.map((t) => (t.id === textId ? { ...t, content: newContent } : t)));
    } catch (error) {
      console.error('텍스트 내용 저장 오류:', error);
      throw error;
    }
  };

  // 텍스트 폰트 크기 변경
  const handleTextFontSizeChange = async (textId: string, fontSize: number) => {
    try {
      const textItem = textItems.find((t) => t.id === textId);
      if (!textItem) return;

      const response = await fetch('/api/text-items/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: textId,
          timeBlockTime: block.time,
          content: textItem.content,
          x: textItem.x,
          y: textItem.y,
          fontSize,
        }),
      });

      if (!response.ok) throw new Error('폰트 크기 저장 실패');

      // 로컬 상태 업데이트
      setTextItems(textItems.map((t) => (t.id === textId ? { ...t, fontSize } : t)));
    } catch (error) {
      console.error('텍스트 폰트 크기 저장 오류:', error);
      throw error;
    }
  };

  // 텍스트 삭제
  const handleTextDelete = async (textId: string) => {
    try {
      const response = await fetch(`/api/text-items/delete?id=${textId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('삭제 실패');

      // 로컬 상태에서 제거
      setTextItems(textItems.filter((t) => t.id !== textId));
    } catch (error) {
      console.error('텍스트 삭제 오류:', error);
      throw error;
    }
  };

  // 새 텍스트 추가
  const handleAddText = async () => {
    const content = prompt('추가할 텍스트를 입력하세요:');
    if (!content) return;

    try {
      const response = await fetch('/api/text-items/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeBlockTime: block.time,
          content,
          x: 20,
          y: 20,
          fontSize: 16,
        }),
      });

      if (!response.ok) throw new Error('텍스트 생성 실패');

      const result = await response.json();
      setTextItems([...textItems, result.data]);
    } catch (error) {
      console.error('텍스트 추가 오류:', error);
      alert('텍스트 추가에 실패했습니다.');
    }
  };

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

      {/* 오른쪽: 사진들과 텍스트를 포함하는 컬럼 */}
      <div className="timeline-section-right">
        {/* 사진들 + 텍스트 컨테이너 (가로 배열) */}
        <div className="timeline-photos-container">
          {/* 사진들 */}
          {block.photos.map((photo, index) => (
            <TimelineImage
              key={`photo-${photo.id}`}
              photo={photo}
              timeBlockTime={block.time}
              onDecorate={onDecorate}
              onRemove={onRemovePhoto}
              onPositionChange={onPhotoPositionChange}
              onResizeEnd={onPhotoResizeEnd}
              index={index}
            />
          ))}

          {/* 텍스트들 */}
          {textItems.map((textItem) => (
            <TimelineText
              key={`text-${textItem.id}`}
              text={textItem}
              onPositionChange={handleTextPositionChange}
              onContentChange={handleTextContentChange}
              onFontSizeChange={handleTextFontSizeChange}
              onDelete={handleTextDelete}
              onBlur={handleTextContentChange}
            />
          ))}
        </div>

        {/* 텍스트 추가 버튼 (항상 컨테이너 하단에 배치) */}
        <button
          onClick={handleAddText}
          className="timeline-add-text-btn"
          title="텍스트 추가"
          style={{
            alignSelf: 'flex-start',
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#E5E5E5',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#333',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            marginLeft: '16px',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#E5E5E5';
          }}
        >
          + 텍스트 추가
        </button>
      </div>
    </div>
  );
}
