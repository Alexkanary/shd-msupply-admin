import { ExpiryStatus } from '../types';

declare global {
  interface Window {
    __CONFIG__?: {
      API_BASE_URL?: string;
      DEFAULT_TIMEZONE?: string;
    };
  }
}

const STORAGE_KEY_TZ = 'shd_msupply_timezone';

export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getSelectedTimezone(): string {
  const saved = localStorage.getItem(STORAGE_KEY_TZ);
  if (saved) return saved;
  if (window.__CONFIG__?.DEFAULT_TIMEZONE) {
    return window.__CONFIG__.DEFAULT_TIMEZONE;
  }
  return getDeviceTimezone();
}

export function setSelectedTimezone(tz: string): void {
  localStorage.setItem(STORAGE_KEY_TZ, tz);
}

/**
 * Format a Date object or UTC ISO string into the live top-bar clock format:
 * "Fri, 16 Oct 2026, 14:08:05 GMT+7 (Asia/Bangkok)"
 */
export function formatLiveClock(date: Date = new Date(), timeZone: string = getSelectedTimezone()): string {
  try {
    const dtf = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
      timeZoneName: 'short',
    });

    const parts = dtf.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

    const weekday = get('weekday');
    const day = get('day');
    const month = get('month');
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    const second = get('second');
    const timeZoneName = get('timeZoneName');

    return `${weekday}, ${day} ${month} ${year}, ${hour}:${minute}:${second} ${timeZoneName} (${timeZone})`;
  } catch {
    return date.toUTCString();
  }
}

/**
 * Format a date/time string with the current configured timezone:
 * "16 Oct 2026, 14:08:05 GMT+7"
 */
export function formatDateTime(
  utcDateString?: string | null,
  options?: { includeSeconds?: boolean; timeZone?: string }
): string {
  if (!utcDateString) return '—';
  try {
    const d = new Date(utcDateString);
    if (isNaN(d.getTime())) return utcDateString;

    const tz = options?.timeZone || getSelectedTimezone();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: options?.includeSeconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: tz,
      timeZoneName: 'short',
    });
    return formatter.format(d);
  } catch {
    return utcDateString;
  }
}

/**
 * Format date only: "16 Oct 2026"
 */
export function formatDate(utcDateString?: string | null, timeZone: string = getSelectedTimezone()): string {
  if (!utcDateString) return '—';
  try {
    const d = new Date(utcDateString);
    if (isNaN(d.getTime())) return utcDateString;

    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone,
    });
    return formatter.format(d);
  } catch {
    return utcDateString;
  }
}

/**
 * Compute Expiry Status:
 * - Green: healthy (> 180 days / 6 months)
 * - Yellow/amber: expiring within 6 months (> 90 days and <= 180 days)
 * - Red: expiring within 3 months or already expired (<= 90 days)
 */
export function getExpiryStatus(expiryDateStr: string): {
  status: ExpiryStatus;
  daysRemaining: number;
  label: string;
} {
  try {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    // Normalize to midnight UTC comparison
    const diffTime = expiry.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        status: 'RED',
        daysRemaining,
        label: `Expired (${Math.abs(daysRemaining)}d ago)`,
      };
    }
    if (daysRemaining <= 90) {
      return {
        status: 'RED',
        daysRemaining,
        label: `Expiring soon (${daysRemaining}d)`,
      };
    }
    if (daysRemaining <= 180) {
      return {
        status: 'AMBER',
        daysRemaining,
        label: `Expiring in <6m (${daysRemaining}d)`,
      };
    }
    return {
      status: 'GREEN',
      daysRemaining,
      label: `Healthy (${Math.round(daysRemaining / 30)}m)`,
    };
  } catch {
    return { status: 'GREEN', daysRemaining: 999, label: 'Healthy' };
  }
}

/**
 * Common time zones for border clinics, NGOs, and global standards
 */
export const AVAILABLE_TIMEZONES = [
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7) — Thailand / Myanmar Border' },
  { value: 'Asia/Yangon', label: 'Asia/Yangon (GMT+6:30) — Myanmar standard' },
  { value: 'UTC', label: 'UTC (GMT+0) — Universal Coordinated Time' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0 / BST)' },
  { value: 'Europe/Geneva', label: 'Europe/Geneva (CET/CEST) — WHO Headquarters' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
];
