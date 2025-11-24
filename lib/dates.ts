import { format, parse, getHours } from 'date-fns';

/**
 * 파일명에서 촬영시간 추출
 * 지원되는 파일명 형식:
 * - 20251124_105832.jpg (yyyyMMdd_HHmmss)
 * - IMG_20251124_105832.jpg
 * - photo_20251124_105832.jpg
 * - 2025-11-24T10-58-32.jpg
 * @param filename 파일명
 * @returns ISO 문자열 또는 null
 */
export const extractPhotoTimestampFromFilename = (filename: string): string | null => {
  try {
    // 패턴 1: yyyyMMdd_HHmmss (예: 20251124_105832)
    const pattern1 = /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;
    const match1 = filename.match(pattern1);
    if (match1) {
      const [, year, month, day, hour, minute, second] = match1;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ).toISOString();
    }

    // 패턴 2: yyyy-MM-dd'T'HH-mm-ss (예: 2025-11-24T10-58-32)
    const pattern2 = /(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/;
    const match2 = filename.match(pattern2);
    if (match2) {
      const [, year, month, day, hour, minute, second] = match2;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ).toISOString();
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Extract hour from EXIF timestamp or file timestamp
 * @param timestamp ISO string or date-like value
 * @returns Hour in HH:MM format (e.g., "06:00", "14:30")
 */
export const getHourFromTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  } catch {
    return '00:00';
  }
};

/**
 * Get display time label for timeline (e.g., "06:00 - 07:00")
 */
export const getTimeLabel = (timestamp: string): string => {
  const hour = getHourFromTimestamp(timestamp);
  const [h, m] = hour.split(':');
  const nextHour = (parseInt(h) + 1).toString().padStart(2, '0');
  return `${hour} - ${nextHour}:00`;
};

/**
 * Format date for timeline header (e.g., "Monday, November 24")
 */
export const formatTimelineDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d');
  } catch {
    return dateString;
  }
};

/**
 * Get date in YYYY-MM-DD format
 */
export const formatDateISO = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Check if two timestamps are on the same day
 */
export const isSameDay = (ts1: string, ts2: string): boolean => {
  const d1 = new Date(ts1).toDateString();
  const d2 = new Date(ts2).toDateString();
  return d1 === d2;
};
