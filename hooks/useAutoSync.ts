import { useState, useEffect } from 'react';
import { AutoSyncResult, SyncStatus } from '@/types';

/**
 * useAutoSync: 자동 동기화를 관리하는 Hook
 * @param interval 동기화 주기 (분 단위)
 * @param enabled 자동 동기화 활성화 여부 (기본값: true)
 */
export const useAutoSync = (interval: number = 60, enabled: boolean = true) => {
  const [syncResult, setSyncResult] = useState<AutoSyncResult | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // 수동 동기화 함수
  const sync = async () => {
    try {
      setStatus('syncing');
      setError(null);

      const response = await fetch('/api/photos/auto-sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('동기화 실패');
      }

      const result: AutoSyncResult = await response.json();
      setSyncResult(result);
      setStatus('success');

      // 3초 후 상태 초기화
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
      setStatus('error');

      // 3초 후 상태 초기화
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // 백그라운드 자동 동기화
  useEffect(() => {
    if (!enabled) return;

    const intervalMs = interval * 60 * 1000;

    // 초기 동기화 (지연 1초)
    const initialTimer = setTimeout(() => {
      sync();
    }, 1000);

    // 반복 동기화
    const syncTimer = setInterval(() => {
      sync();
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(syncTimer);
    };
  }, [interval, enabled]);

  return { sync, syncResult, status, error };
};
