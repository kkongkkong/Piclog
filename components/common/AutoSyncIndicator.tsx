'use client';

import { SyncStatus, AutoSyncResult } from '@/types';

interface AutoSyncIndicatorProps {
  status: SyncStatus;
  result?: AutoSyncResult | null;
}

/**
 * AutoSyncIndicator: 자동 동기화 상태 표시
 * - "자동 동기화 중…" 로딩
 * - "새로운 사진 N장이 추가되었습니다" 성공
 * - 에러 표시
 */
export function AutoSyncIndicator({ status, result }: AutoSyncIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={`sync-indicator ${
      status === 'success' ? 'bg-green-500' :
      status === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    }`}>
      {status === 'syncing' && (
        <>
          <div className="sync-spinner"></div>
          <span>자동 동기화 중…</span>
        </>
      )}

      {status === 'success' && result && (
        <>
          <span>✓</span>
          <span>
            새로운 사진 {result.newPhotos.length}장이 추가되었습니다
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <span>✕</span>
          <span>동기화 실패</span>
        </>
      )}
    </div>
  );
}
