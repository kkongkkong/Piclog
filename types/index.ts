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
