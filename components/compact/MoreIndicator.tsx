'use client';

interface MoreIndicatorProps {
  count: number;
}

/**
 * MoreIndicator: +N 표시
 * - 4장 이상의 사진이 있을 때 표시
 */
export function MoreIndicator({ count }: MoreIndicatorProps) {
  if (count <= 0) return null;

  return <span className="more-indicator">+{count}</span>;
}
