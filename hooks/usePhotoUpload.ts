import { useState } from 'react';
import { PhotoItem } from '@/types';

/**
 * usePhotoUpload: 사진 업로드 및 삭제 기능을 관리하는 Hook
 * - 단일 파일 또는 여러 파일 업로드 지원
 * - 시간대별 최대 3장까지만 업로드 가능
 */
export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    files: File | File[],
    labels?: string | string[]
  ): Promise<PhotoItem[] | null> => {
    try {
      setUploading(true);
      setError(null);

      // 단일 파일인 경우 배열로 변환
      const fileArray = Array.isArray(files) ? files : [files];
      const labelArray = Array.isArray(labels) ? labels : [labels || ''];

      const results: PhotoItem[] = [];
      const errors: string[] = [];

      // 파일 하나씩 업로드
      for (let i = 0; i < fileArray.length; i++) {
        try {
          const file = fileArray[i];
          const label = labelArray[i] || '';

          // FormData로 파일 전송
          const formData = new FormData();
          formData.append('file', file);
          if (label) {
            formData.append('label', label);
          }

          const response = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            errors.push(
              `${file.name}: ${data.error || '업로드 실패'}`
            );
            continue;
          }

          const photo: PhotoItem = await response.json();
          results.push(photo);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
          errors.push(`파일 ${i + 1}: ${errorMsg}`);
        }
      }

      // 에러가 있으면 에러 메시지 설정
      if (errors.length > 0) {
        const errorMsg = errors.join('\n');
        setError(errorMsg);
      }

      // 최소 하나라도 성공했으면 성공 반환
      return results.length > 0 ? results : null;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, url: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch('/api/photos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId, url }),
      });

      if (!response.ok) {
        throw new Error('사진 삭제 실패');
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMsg);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { upload, uploading, deletePhoto, deleting, error };
};
