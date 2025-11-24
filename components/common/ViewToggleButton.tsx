'use client';

import { ViewMode } from '@/types';

interface ViewToggleButtonProps {
  mode: ViewMode;
  onToggle: () => void;
}

/**
 * ViewToggleButton: 기본뷰 ↔ 요약뷰 토글 버튼
 */
export function ViewToggleButton({ mode, onToggle }: ViewToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="btn btn-secondary"
      title={mode === 'default' ? '요약뷰로 보기' : '전체 보기'}
    >
      {mode === 'default' ? (
        <>
          <span>📋</span> 요약뷰
        </>
      ) : (
        <>
          <span>🖼️</span> 전체
        </>
      )}
    </button>
  );
}
