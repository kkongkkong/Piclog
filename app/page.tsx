'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

  const handleDecorate = (photoId: string) => {
    router.push(`/decorate?photoId=${photoId}`);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 (고정) */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 h-20 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* 왼쪽: 제목 + 날짜 */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">📸 오늘의 기록</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* 오른쪽: 날짜 선택 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleToday}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="오늘"
            >
              📅
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="w-full">
        {/* 타임라인 뷰 */}
        {mode === 'default' ? (
          <TimelineContainer
            data={timeline}
            loading={loading}
            error={error}
            onDeletePhoto={deletePhoto}
            onPhotoDelete={refetch}
            onDecorate={handleDecorate}
          />
        ) : (
          <CompactViewContainer data={timeline} loading={loading} error={error} />
        )}
      </main>

      {/* 하단 메뉴바 (고정) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="w-full max-w-6xl mx-auto px-4 flex items-center justify-around h-20">
          {/* 타임라인 보기 */}
          <button
            onClick={() => {
              if (mode !== 'default') toggleMode();
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              mode === 'default'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="타임라인 보기"
          >
            <span className="text-xl">📑</span>
            <span className="text-xs font-medium hidden sm:block">타임라인</span>
          </button>

          {/* 사진 추가 */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            title="사진 추가"
          >
            <span className="text-xl">➕</span>
            <span className="text-xs font-medium hidden sm:block">사진 추가</span>
          </button>

          {/* 나의 스티커 (컴팩트 뷰) */}
          <button
            onClick={() => {
              if (mode !== 'compact') toggleMode();
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              mode === 'compact'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="요약 보기"
          >
            <span className="text-xl">⭐</span>
            <span className="text-xs font-medium hidden sm:block">요약</span>
          </button>
        </div>
      </nav>

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
