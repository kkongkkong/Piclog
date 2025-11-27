'use client';

import { useState } from 'react';
import { useNukki } from '@/hooks';

interface NukkiButtonProps {
  imageUrl: string;
  onNukkiResult: (nukkiImageUrl: string) => void;
}

/**
 * NukkiButton: 배경 제거(누끼) 버튼 컴포넌트
 * - 이미지의 배경을 제거
 * - 결과 이미지를 부모 컴포넌트로 전달
 * - 로딩 상태 표시
 */
export function NukkiButton({ imageUrl, onNukkiResult }: NukkiButtonProps) {
  const { removeBackground, processing, error, clearError } = useNukki();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClick = async () => {
    setLocalError(null);
    clearError();

    const result = await removeBackground(imageUrl);
    if (result) {
      onNukkiResult(result);
    } else {
      setLocalError(error || '배경 제거에 실패했습니다');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={processing}
        className="btn btn-primary"
        title="선택한 사진의 배경을 제거하여 스티커로 만듭니다"
      >
        {processing ? (
          <>
            <span className="animate-spin inline-block mr-2">⏳</span>
            처리 중...
          </>
        ) : (
          <>
            ✨ 누끼 따기
          </>
        )}
      </button>
      {(localError || error) && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
          {localError || error}
        </div>
      )}
    </div>
  );
}
