// === Photo & Timeline Types ===
export type PhotoItem = {
  id: string;
  url: string;
  createdAt: string; // EXIF timestamp (ISO string)
  label?: string;
};

export type TimelineBlock = {
  time: string; // e.g., "06:00"
  photos: PhotoItem[];
};

export type TimelineData = TimelineBlock[];

// === Auto Sync Types ===
export type AutoSyncResult = {
  scannedAt: string; // ISO string
  newPhotos: PhotoItem[];
  skippedCount: number;
};

// === UI State Types ===
export type ViewMode = 'default' | 'compact';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// === Settings Types ===
export type SyncInterval = 30 | 60 | 180 | 1440; // minutes: 30min, 1h, 3h, 1day

export type Settings = {
  syncInterval: SyncInterval;
  viewMode: ViewMode;
  userId?: string;
};

// === Decoration & Nukki Types ===
export type DecorationElement = {
  id: string;
  type: 'nukki' | 'sticker' | 'text';
  imageUrl?: string; // nukki의 배경제거된 PNG URL
  text?: string; // text element의 텍스트
  x: number; // canvas 상의 x 좌표 (px)
  y: number; // canvas 상의 y 좌표 (px)
  scale: number; // 스케일 (1.0 = 100%)
  rotation: number; // 회전 각도 (degree)
  zIndex: number; // 레이어 순서
  createdAt: string; // ISO string
};

export type DecorationData = {
  photoId: string; // 적용할 기본 사진 ID
  decorations: DecorationElement[];
  resultImageUrl?: string; // 최종 합성 이미지 (저장 후)
  updatedAt: string; // ISO string
};

export type NukkiResult = {
  success: boolean;
  imageUrl: string; // 배경제거된 PNG URL
  message?: string;
  error?: string;
};

// === Photo Position Type (드래그 기능) ===
export type PhotoPosition = {
  photoId: string;
  timeBlockTime: string; // e.g., "09:00"
  x: number; // 절대 위치 (px, TimelineSection 기준)
  y: number; // 절대 위치 (px, TimelineSection 기준)
};
