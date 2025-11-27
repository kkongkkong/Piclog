'use client';

import { useRef, useEffect, useState } from 'react';
import { DecorationElement } from '@/types';
import Image from 'next/image';

interface DecorateCanvasProps {
  baseImageUrl: string;
  decorations: DecorationElement[];
  selectedElementId?: string;
  onSelectElement?: (elementId: string) => void;
  onMoveElement?: (elementId: string, x: number, y: number) => void;
  onScaleElement?: (elementId: string, scale: number) => void;
  onRotateElement?: (elementId: string, rotation: number) => void;
}

/**
 * DecorateCanvas: Canvas 기반의 데코레이션 영역
 * - 기본 사진 표시
 * - Decoration Element들을 Canvas에 렌더링
 * - Drag & Drop, Resize, Rotate 기능
 */
export function DecorateCanvas({
  baseImageUrl,
  decorations,
  selectedElementId,
  onSelectElement,
  onMoveElement,
  onScaleElement,
  onRotateElement,
}: DecorateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [baseImageDimensions, setBaseImageDimensions] = useState({ width: 0, height: 0 });
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 기본 이미지 로드
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setBaseImageDimensions({ width: img.width, height: img.height });
    };
    img.src = baseImageUrl;
  }, [baseImageUrl]);

  const handleElementMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    isResizeHandle?: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    onSelectElement?.(elementId);

    if (!isResizeHandle) {
      setDraggingElement(elementId);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !canvasRef.current) return;

    const element = decorations.find((el) => el.id === draggingElement);
    if (!element) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const newX = element.x + deltaX;
    const newY = element.y + deltaY;

    onMoveElement?.(draggingElement, newX, newY);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        cursor: draggingElement ? 'grabbing' : 'grab',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 기본 이미지 */}
      <div className="relative w-full h-full">
        <Image
          src={baseImageUrl}
          alt="Base"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Decoration Elements */}
      {decorations
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((decoration) => (
          <div
            key={decoration.id}
            className={`absolute cursor-move transition-all ${
              selectedElementId === decoration.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              left: `${decoration.x}px`,
              top: `${decoration.y}px`,
              width: `${decoration.scale * 100}px`,
              height: `${decoration.scale * 100}px`,
              transform: `rotate(${decoration.rotation}deg)`,
              zIndex: decoration.zIndex,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, decoration.id)}
          >
            {decoration.type === 'nukki' && decoration.imageUrl && (
              <Image
                src={decoration.imageUrl}
                alt="Nukki"
                fill
                className="object-contain pointer-events-none"
              />
            )}
            {decoration.type === 'text' && decoration.text && (
              <div className="w-full h-full flex items-center justify-center text-black text-sm font-bold pointer-events-none whitespace-pre-wrap break-words">
                {decoration.text}
              </div>
            )}

            {/* 선택된 요소에 Resize Handle 표시 */}
            {selectedElementId === decoration.id && (
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize"
                onMouseDown={(e) => handleElementMouseDown(e, decoration.id, true)}
              />
            )}
          </div>
        ))}
    </div>
  );
}
