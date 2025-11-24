'use client';

import Image from 'next/image';

interface ThumbnailMiniProps {
  url: string;
  alt?: string;
}

/**
 * ThumbnailMini: 요약뷰용 작은 썸네일
 * - 40x40px 크기
 * - 정사각형 비율
 */
export function ThumbnailMini({ url, alt = '썸네일' }: ThumbnailMiniProps) {
  return (
    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        sizes="40px"
      />
    </div>
  );
}
