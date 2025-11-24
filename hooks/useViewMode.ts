import { useState, useEffect } from 'react';
import { ViewMode } from '@/types';

const STORAGE_KEY = 'piclog_viewmode';

/**
 * useViewMode: 기본뷰/요약뷰 토글을 관리하는 Hook
 */
export const useViewMode = () => {
  const [mode, setMode] = useState<ViewMode>('default');
  const [mounted, setMounted] = useState(false);

  // 초기화: localStorage에서 저장된 모드 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved && (saved === 'default' || saved === 'compact')) {
      setMode(saved);
    }
    setMounted(true);
  }, []);

  // 모드 변경 시 localStorage에 저장
  const toggleMode = () => {
    const newMode: ViewMode = mode === 'default' ? 'compact' : 'default';
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  return { mode, toggleMode, mounted };
};
