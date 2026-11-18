import {
  MS_PER_DAY,
  TOTAL_GRID_CELLS,
  WEEKDAYS,
  type CalendarCell,
  type DDayMeta,
} from './calendar.types';

/** 날짜의 시/분/초를 제거한 로컬 자정 Date 객체를 반환합니다. */
export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 두 Date 객체가 같은 연/월/일인지 비교합니다. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** YYYY-MM-DD 형식의 날짜 저장소 키 문자열을 반환합니다. */
export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** YYYY-MM-DD (DAY) 형식의 문자열로 포맷팅합니다. */
export function formatSelectedDate(date: Date): string {
  const day = WEEKDAYS[date.getDay()];
  return `${toDateKey(date)} (${day})`;
}

/** 오늘 기준 상대 D-Day 라벨과 배지 변형을 계산합니다. */
export function getDDayMeta(target: Date, baseToday: Date): DDayMeta {
  // DST 전환으로 24시간이 어긋나지 않도록 UTC 자정 타임스탬프로 일수 차이를 계산합니다.
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcToday = Date.UTC(baseToday.getFullYear(), baseToday.getMonth(), baseToday.getDate());
  const diffDays = Math.round((utcTarget - utcToday) / MS_PER_DAY);

  if (diffDays === 0) {
    return { label: 'TODAY', variant: 'accent' };
  }
  if (diffDays > 0) {
    return { label: `D-${diffDays}`, variant: 'secondary' };
  }
  return { label: `D+${Math.abs(diffDays)}`, variant: 'neutral' };
}

export interface BuildCalendarCellsParams {
  year: number;
  month: number;
  today: Date;
  selectedDate: Date;
  memos: Record<string, string>;
}

/** 현재 조회 중인 연/월에 대한 6x7(42칸) 달력 셀 배열을 생성합니다. */
export function buildCalendarCells(params: BuildCalendarCellsParams): CalendarCell[] {
  const { year, month, today, selectedDate, memos } = params;
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < TOTAL_GRID_CELLS; i++) {
    const cellDate = new Date(year, month, 1 - startOffset + i);
    const dateKey = toDateKey(cellDate);
    const memoText = memos[dateKey];
    cells.push({
      date: cellDate,
      dateKey,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getFullYear() === year && cellDate.getMonth() === month,
      isToday: isSameDay(cellDate, today),
      isSelected: isSameDay(cellDate, selectedDate),
      hasMemo: Boolean(memoText?.trim()),
      dayOfWeek: cellDate.getDay(),
    });
  }
  return cells;
}
