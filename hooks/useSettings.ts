import { useState, useEffect } from 'react';
import { Settings, SyncInterval } from '@/types';

const STORAGE_KEY = 'piclog_settings';

const DEFAULT_SETTINGS: Settings = {
  syncInterval: 60,
  viewMode: 'default',
};

/**
 * useSettings: 사용자 설정을 관리하는 Hook
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // 초기화: localStorage에서 저장된 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Settings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('설정 로드 실패:', err);
      }
    }
    setMounted(true);
  }, []);

  // 설정 변경
  const updateSyncInterval = (interval: SyncInterval) => {
    const updated = { ...settings, syncInterval: interval };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { settings, updateSyncInterval, mounted };
};
