import { MAX_MEMO_LENGTH } from './calendar.types';

export const CALENDAR_MEMO_STORAGE_KEY = 'ferdy:calendar:memos';

/**
 * Draft 스토리지 헬퍼: localStorage에서 날짜별 메모 맵을 불러옵니다.
 * 추후 공용 스토리지/OPFS 계층으로 교체하기 쉽도록 컴포넌트와 분리해 유지합니다.
 */
export function loadCalendarMemos(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(CALENDAR_MEMO_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        result[key] = value.slice(0, MAX_MEMO_LENGTH);
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Draft 스토리지 헬퍼: 날짜별 메모 맵을 localStorage에 저장합니다. */
export function saveCalendarMemos(memos: Record<string, string>): void {
  try {
    window.localStorage.setItem(CALENDAR_MEMO_STORAGE_KEY, JSON.stringify(memos));
  } catch {
    // 스토리지 접근 제한 또는 용량 초과 시 UI 동작은 유지합니다.
  }
}
