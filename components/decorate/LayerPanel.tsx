'use client';

import { DecorationElement } from '@/types';

interface LayerPanelProps {
  decorations: DecorationElement[];
  selectedElementId?: string;
  onSelectElement?: (elementId: string) => void;
}

/**
 * LayerPanel: 데코레이션 요소들의 레이어 목록
 * - 현재 적용된 모든 요소 표시
 * - 요소 선택
 * - 각 요소의 기본 정보 표시
 */
export function LayerPanel({
  decorations,
  selectedElementId,
  onSelectElement,
}: LayerPanelProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-700 mb-4">레이어</h3>

      {decorations.length === 0 ? (
        <p className="text-gray-500 text-sm">추가된 요소가 없습니다</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {decorations
            .sort((a, b) => b.zIndex - a.zIndex)
            .map((decoration) => (
              <button
                key={decoration.id}
                onClick={() => onSelectElement?.(decoration.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedElementId === decoration.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {decoration.type === 'nukki' && '✨ 누끼'}
                    {decoration.type === 'sticker' && '🎨 스티커'}
                    {decoration.type === 'text' && '📝 텍스트'}
                  </span>
                  <span className="text-xs opacity-70">z:{decoration.zIndex}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
