'use client';

import { Suspense } from 'react';
import DecoratePageContent from './DecoratePageContent';

// 동적 렌더링 설정 (query params 사용으로 정적 생성 불가)
export const dynamic = 'force-dynamic';

/**
 * Decorate Page: /decorate?photoId=XXX
 * 선택한 사진을 꾸미는 페이지
 */
export default function DecoratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      }
    >
      <DecoratePageContent />
    </Suspense>
  );
}
