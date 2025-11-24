'use client';

import { useState } from 'react';
import { formatDateISO } from '@/lib/dates';
import {
  useTimeline,
  usePhotoUpload,
  useAutoSync,
  useViewMode,
  useSettings,
} from '@/hooks';
import {
  TimelineContainer,
  CompactViewContainer,
  ViewToggleButton,
  AutoSyncIndicator,
  UploadModal,
} from '@/components';

export default function Home() {
  // 현재 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO());

  // UI 상태
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Hooks
  const { timeline, loading, error, refetch } = useTimeline(selectedDate);
  const { upload, uploading, deletePhoto } = usePhotoUpload();
  const { sync, status } = useAutoSync(60, true);
  const { mode, toggleMode, mounted } = useViewMode();
  const { settings } = useSettings();

  // 사진 업로드 핸들러 (여러 파일 지원)
  const handleUploadSubmit = async (files: File[], labels?: string[]) => {
    const result = await upload(files, labels);
    if (result && result.length > 0) {
      // 업로드 성공 후 타임라인 새로고침
      await refetch();
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // 이전/다음 날짜 네비게이션
  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDateISO(date));
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDateISO(date));
  };

  const handleToday = () => {
    setSelectedDate(formatDateISO());
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 헤더: 날짜 선택 & 버튼 */}
      <div className="timeline-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 날짜 선택 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousDay}
              className="btn btn-secondary btn-small"
            >
              ← 이전
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNextDay}
              className="btn btn-secondary btn-small"
            >
              다음 →
            </button>
            <button
              onClick={handleToday}
              className="btn btn-secondary btn-small"
            >
              오늘
            </button>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <ViewToggleButton mode={mode} onToggle={toggleMode} />
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              📤 업로드
            </button>
          </div>
        </div>
      </div>

      {/* 타임라인 뷰 */}
      {mode === 'default' ? (
        <TimelineContainer
          data={timeline}
          loading={loading}
          error={error}
          onDeletePhoto={deletePhoto}
          onPhotoDelete={refetch}
        />
      ) : (
        <CompactViewContainer data={timeline} loading={loading} error={error} />
      )}

      {/* 업로드 모달 */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
        uploading={uploading}
      />

      {/* 자동 동기화 인디케이터 */}
      <AutoSyncIndicator status={status} />
    </div>
  );
}
