import { useState, useEffect, useCallback } from 'react';
import { TimelineBlock, TimelineData } from '@/types';

/**
 * useTimeline: 특정 날짜의 타임라인 데이터를 조회하는 Hook
 * @param date YYYY-MM-DD 형식의 날짜
 */
export const useTimeline = (date: string) => {
  const [timeline, setTimeline] = useState<TimelineData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/timeline?date=${date}`);
      if (!response.ok) {
        throw new Error('타임라인 조회 실패');
      }

      const data: TimelineData = await response.json();
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchTimeline();
    }
  }, [date, fetchTimeline]);

  // refetch: 수동으로 데이터 새로고침
  const refetch = useCallback(async () => {
    await fetchTimeline();
  }, [fetchTimeline]);

  return { timeline, loading, error, refetch };
};
