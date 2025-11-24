'use client';

import { useRef, useState } from 'react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[], labels?: string[]) => Promise<void>;
  uploading?: boolean;
}

const MAX_FILES = 5;

/**
 * UploadModal: 사진 업로드 모달
 * - 최대 5장까지 파일 선택
 * - 각 파일별 라벨(메모) 입력
 * - 일괄 업로드
 */
export function UploadModal({
  isOpen,
  onClose,
  onSubmit,
  uploading = false,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newLabels: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // 최대 5장까지만 추가
      if (newFiles.length >= MAX_FILES) return;
      if (!file.type.startsWith('image/')) return;

      newFiles.push(file);
      newLabels.push('');

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        // 모든 파일이 로드되면 상태 업데이트
        if (newPreviews.length === newFiles.length) {
          setSelectedFiles(newFiles);
          setLabels(newLabels);
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    // 파일이 없으면 즉시 업데이트
    if (newFiles.length === 0) {
      setSelectedFiles([]);
      setLabels([]);
      setPreviews([]);
    }
  };

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newLabels = labels.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setLabels(newLabels);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    try {
      await onSubmit(selectedFiles, labels);
      // 성공 시 모달 닫기
      handleReset();
      onClose();
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setLabels([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">사진 업로드</h2>
        <p className="text-sm text-gray-500 mb-4">최대 {MAX_FILES}장까지 선택 가능합니다</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 파일 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              사진 선택 ({selectedFiles.length}/{MAX_FILES})
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading || selectedFiles.length >= MAX_FILES}
            />
          </div>

          {/* 선택된 파일 목록 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-gray-100">
                  {/* 미리보기 */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-html-element-for-img */}
                    <img
                      src={previews[index]}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <input
                      type="text"
                      placeholder="메모 (선택사항)"
                      value={labels[index]}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      maxLength={50}
                      disabled={uploading}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 제거 버튼 */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-red-500 hover:text-red-700 font-bold disabled:opacity-50"
                    title="제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 justify-end mt-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              disabled={uploading}
              className="btn btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0 || uploading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '업로드 중...' : `업로드 (${selectedFiles.length}장)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
