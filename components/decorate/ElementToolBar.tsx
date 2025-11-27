'use client';

import { useState } from 'react';
import { DecorationElement } from '@/types';

interface ElementToolBarProps {
  element: DecorationElement | null;
  onScaleChange?: (scale: number) => void;
  onRotationChange?: (rotation: number) => void;
  onDelete?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onAddText?: (text: string) => void;
  onTextChange?: (text: string) => void;
}

/**
 * ElementToolBar: 선택된 요소를 조정하는 도구 모음
 * - Scale 조정 (슬라이더)
 * - Rotation 조정 (슬라이더)
 * - 레이어 순서 조정
 * - 삭제
 */
export function ElementToolBar({
  element,
  onScaleChange,
  onRotationChange,
  onDelete,
  onBringToFront,
  onSendToBack,
  onAddText,
  onTextChange,
}: ElementToolBarProps) {
  const [textInput, setTextInput] = useState('');

  const handleAddText = () => {
    if (textInput.trim()) {
      onAddText?.(textInput);
      setTextInput('');
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextInput(text);
    if (element?.type === 'text') {
      onTextChange?.(text);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h3 className="font-semibold text-gray-700">요소 편집</h3>

      {!element ? (
        <>
          {/* 텍스트 추가 섹션 (요소 선택 안 했을 때) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              📝 텍스트 추가
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="추가할 텍스트 입력..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
            />
            <button
              onClick={handleAddText}
              disabled={!textInput.trim()}
              className="btn btn-primary w-full"
            >
              텍스트 추가
            </button>
          </div>

          <div className="text-gray-500 text-sm">
            선택한 요소가 없습니다
          </div>
        </>
      ) : (
        <>
          {/* 선택된 요소 편집 */}
          {element.type === 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                텍스트 수정
              </label>
              <textarea
                value={element.text || ''}
                onChange={handleTextInputChange}
                placeholder="텍스트 입력..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Scale Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              크기: {(element.scale * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={element.scale}
              onChange={(e) => onScaleChange?.(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Rotation Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              회전: {element.rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={element.rotation}
              onChange={(e) => onRotationChange?.(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Layer Control Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onBringToFront}
              className="btn btn-secondary btn-small flex-1"
              title="맨 앞으로"
            >
              ↑ 앞
            </button>
            <button
              onClick={onSendToBack}
              className="btn btn-secondary btn-small flex-1"
              title="맨 뒤로"
            >
              ↓ 뒤
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="btn btn-secondary w-full"
            title="이 요소 삭제"
          >
            🗑️ 삭제
          </button>
        </>
      )}
    </div>
  );
}
