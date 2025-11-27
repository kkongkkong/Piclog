import { useState } from 'react';
import { NukkiResult } from '@/types';

/**
 * useNukki: 배경 제거(누끼) 기능을 관리하는 Hook
 * - 이미지 URL을 받아서 배경 제거 API 호출
 * - 배경제거된 PNG URL 반환
 * - 로딩 및 에러 상태 관리
 */
export const useNukki = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeBackground = async (imageUrl: string): Promise<string | null> => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/photos/remove-bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || '배경 제거 실패';
        setError(errorMsg);
        return null;
      }

      const result: NukkiResult = await response.json();

      if (!result.success) {
        setError(result.error || '배경 제거 실패');
        return null;
      }

      return result.imageUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    removeBackground,
    processing,
    error,
    clearError,
  };
};
