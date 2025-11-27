'use client';

import { useState, useCallback } from 'react';
import { PhotoItem, DecorationElement } from '@/types';
import { DecorateCanvas, NukkiButton, ElementToolBar, LayerPanel } from './index';

interface DecorateContainerProps {
  photo: PhotoItem;
  onSaveDecorations?: (decorations: DecorationElement[]) => Promise<void>;
}

/**
 * DecorateContainer: 데코레이션 기능의 메인 컨테이너
 * - 데코레이션 상태 관리
 * - Canvas, Nukki, 도구들을 조율
 * - 저장 기능
 */
export function DecorateContainer({ photo, onSaveDecorations }: DecorateContainerProps) {
  const [decorations, setDecorations] = useState<DecorationElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedElement = decorations.find((el) => el.id === selectedElementId) || null;

  // 누끼 결과 처리
  const handleNukkiResult = useCallback(
    (nukkiImageUrl: string) => {
      const newDecoration: DecorationElement = {
        id: crypto.randomUUID(),
        type: 'nukki',
        imageUrl: nukkiImageUrl,
        x: 50,
        y: 50,
        scale: 0.5,
        rotation: 0,
        zIndex: decorations.length,
        createdAt: new Date().toISOString(),
      };

      setDecorations((prev) => [...prev, newDecoration]);
      setSelectedElementId(newDecoration.id);
    },
    [decorations.length]
  );

  // 요소 선택
  const handleSelectElement = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
  }, []);

  // 요소 이동
  const handleMoveElement = useCallback((elementId: string, x: number, y: number) => {
    setDecorations((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, x, y } : el))
    );
  }, []);

  // 요소 스케일 변경
  const handleScaleElement = useCallback((elementId: string, scale: number) => {
    setDecorations((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, scale } : el))
    );
  }, []);

  // 요소 회전 변경
  const handleRotateElement = useCallback((elementId: string, rotation: number) => {
    setDecorations((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, rotation } : el))
    );
  }, []);

  // 요소 삭제
  const handleDeleteElement = useCallback(() => {
    if (!selectedElementId) return;
    setDecorations((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(undefined);
  }, [selectedElementId]);

  // 텍스트 추가
  const handleAddText = useCallback(
    (text: string) => {
      const newDecoration: DecorationElement = {
        id: crypto.randomUUID(),
        type: 'text',
        text,
        x: 50,
        y: 150,
        scale: 1,
        rotation: 0,
        zIndex: decorations.length,
        createdAt: new Date().toISOString(),
      };

      setDecorations((prev) => [...prev, newDecoration]);
      setSelectedElementId(newDecoration.id);
    },
    [decorations.length]
  );

  // 텍스트 수정
  const handleTextChange = useCallback(
    (text: string) => {
      if (!selectedElementId) return;
      setDecorations((prev) =>
        prev.map((el) =>
          el.id === selectedElementId ? { ...el, text } : el
        )
      );
    },
    [selectedElementId]
  );

  // 요소를 맨 앞으로 (zIndex 최대값)
  const handleBringToFront = useCallback(() => {
    if (!selectedElementId) return;
    setDecorations((prev) => {
      const maxZIndex = Math.max(...prev.map((el) => el.zIndex), 0);
      return prev.map((el) =>
        el.id === selectedElementId ? { ...el, zIndex: maxZIndex + 1 } : el
      );
    });
  }, [selectedElementId]);

  // 요소를 맨 뒤로 (zIndex 0)
  const handleSendToBack = useCallback(() => {
    if (!selectedElementId) return;
    setDecorations((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, zIndex: -1 } : el))
    );
  }, [selectedElementId]);

  // 저장
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      if (onSaveDecorations) {
        await onSaveDecorations(decorations);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // 3초 후 메시지 사라짐
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '저장 실패';
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📸 사진 꾸미기</h1>
        <button
          onClick={handleSave}
          disabled={saving || decorations.length === 0}
          className="btn btn-primary"
        >
          {saving ? '저장 중...' : '💾 저장'}
        </button>
      </div>

      {/* 메시지 */}
      {saveError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          저장 실패: {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          저장되었습니다!
        </div>
      )}

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas 영역 (큼) */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            <DecorateCanvas
              baseImageUrl={photo.url}
              decorations={decorations}
              selectedElementId={selectedElementId}
              onSelectElement={handleSelectElement}
              onMoveElement={handleMoveElement}
              onScaleElement={handleScaleElement}
              onRotateElement={handleRotateElement}
            />

            {/* 누끼 버튼 */}
            <NukkiButton
              imageUrl={photo.url}
              onNukkiResult={handleNukkiResult}
            />
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 레이어 패널 */}
          <LayerPanel
            decorations={decorations}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
          />

          {/* 요소 도구 */}
          <ElementToolBar
            element={selectedElement}
            onScaleChange={(scale) =>
              selectedElementId && handleScaleElement(selectedElementId, scale)
            }
            onRotationChange={(rotation) =>
              selectedElementId && handleRotateElement(selectedElementId, rotation)
            }
            onDelete={handleDeleteElement}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onAddText={handleAddText}
            onTextChange={handleTextChange}
          />
        </div>
      </div>
    </div>
  );
}
