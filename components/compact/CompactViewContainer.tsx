'use client';

import { TimelineData } from '@/types';
import { CompactTimelineRow } from './CompactTimelineRow';

interface CompactViewContainerProps {
  data: TimelineData;
  loading?: boolean;
  error?: string | null;
}

/**
 * CompactViewContainer: 요약뷰 전체 컨테이너
 * - 한눈에 보는 압축된 타임라인
 * - 스크롤 부담 해소
 */
export function CompactViewContainer({
  data,
  loading = false,
  error = null,
}: CompactViewContainerProps) {
  if (loading) {
    return (
      <div className="compact-view flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compact-view flex items-center justify-center py-12">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="compact-view flex items-center justify-center py-12">
        <p className="text-gray-500 text-center">
          이 날짜에 기록된 사진이 없습니다.
          <br />
          사진을 업로드해보세요! 📸
        </p>
      </div>
    );
  }

  return (
    <div className="compact-view border rounded-lg bg-white shadow-sm">
      {data.map((block) => (
        <CompactTimelineRow key={block.time} block={block} />
      ))}
    </div>
  );
}
