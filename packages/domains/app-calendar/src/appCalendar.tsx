import { Component, For, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { fd } from '@ferdy/ui';
import './appCalendar.css';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const TOTAL_GRID_CELLS = 42;
const MS_PER_DAY = 86_400_000;

interface CalendarCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dayOfWeek: number;
}

/** 날짜의 시/분/초를 제거한 로컬 자정 Date 객체를 반환합니다. */
function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 두 Date 객체가 같은 연/월/일인지 비교합니다. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** YYYY-MM-DD (DAY) 형식의 문자열로 포맷팅합니다. */
function formatSelectedDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = WEEKDAYS[date.getDay()];
  return `${yyyy}-${mm}-${dd} (${day})`;
}

/** 오늘 기준 상대 D-Day 라벨과 배지 변형을 계산합니다. */
function getDDayMeta(target: Date, baseToday: Date): {
  label: string;
  variant: 'accent' | 'secondary' | 'neutral';
} {
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

export const AppCalendar: Component = () => {
  const [today, setToday] = createSignal<Date>(normalizeDate(new Date()));
  const [viewDate, setViewDate] = createSignal<Date>(
    new Date(today().getFullYear(), today().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = createSignal<Date>(today());

  onMount(() => {
    const timer = window.setInterval(() => {
      const current = normalizeDate(new Date());
      if (!isSameDay(current, today())) {
        setToday(current);
      }
    }, 60_000);

    onCleanup(() => {
      window.clearInterval(timer);
    });
  });

  const viewYear = () => viewDate().getFullYear();
  const viewMonth = () => viewDate().getMonth();

  const headerYearMonth = () =>
    `${viewYear()}. ${String(viewMonth() + 1).padStart(2, '0')}`;

  const headerMonthName = () => MONTH_NAMES[viewMonth()];

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    const current = normalizeDate(new Date());
    setToday(current);
    setSelectedDate(current);
    setViewDate(new Date(current.getFullYear(), current.getMonth(), 1));
  };

  const handleSelectCell = (cell: CalendarCell) => {
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  const calendarCells = createMemo<CalendarCell[]>(() => {
    const year = viewYear();
    const month = viewMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = firstDayOfMonth.getDay();
    const currentToday = today();
    const currentSelected = selectedDate();

    const cells: CalendarCell[] = [];
    for (let i = 0; i < TOTAL_GRID_CELLS; i++) {
      const cellDate = new Date(year, month, 1 - startOffset + i);
      cells.push({
        date: cellDate,
        dayNumber: cellDate.getDate(),
        isCurrentMonth: cellDate.getFullYear() === year && cellDate.getMonth() === month,
        isToday: isSameDay(cellDate, currentToday),
        isSelected: isSameDay(cellDate, currentSelected),
        dayOfWeek: cellDate.getDay(),
      });
    }
    return cells;
  });

  const dDayMeta = createMemo(() => getDDayMeta(selectedDate(), today()));

  return (
    <div class="app-calendar">
      <header class="cal-header">
        <div class="cal-title-group">
          <fd.Icon name="calendar" size="md" class="cal-title-icon" />
          <div class="cal-title-text">
            <span class="cal-year-month">{headerYearMonth()}</span>
            <span class="cal-month-name">{headerMonthName()}</span>
          </div>
        </div>

        <div class="cal-nav-group">
          <fd.Button
            variant="neutral"
            size="sm"
            class="cal-nav-btn"
            aria-label="이전 달"
            title="이전 달"
            onClick={() => shiftMonth(-1)}
          >
            <fd.Icon name="chevron-left" size="sm" />
          </fd.Button>
          <fd.Button variant="accent-ghost" size="sm" onClick={jumpToToday}>
            Today
          </fd.Button>
          <fd.Button
            variant="neutral"
            size="sm"
            class="cal-nav-btn"
            aria-label="다음 달"
            title="다음 달"
            onClick={() => shiftMonth(1)}
          >
            <fd.Icon name="chevron-right" size="sm" />
          </fd.Button>
        </div>
      </header>

      <div class="cal-weekdays" role="row">
        <For each={WEEKDAYS}>
          {(day, index) => (
            <div
              class="cal-weekday"
              classList={{
                'is-sun': index() === 0,
                'is-sat': index() === 6,
              }}
              role="columnheader"
            >
              {day}
            </div>
          )}
        </For>
      </div>

      <div class="cal-grid" role="grid" aria-label={`${headerYearMonth()} 달력`}>
        <For each={calendarCells()}>
          {(cell) => (
            <button
              type="button"
              class="cal-cell"
              classList={{
                'is-other-month': !cell.isCurrentMonth,
                'is-today': cell.isToday,
                'is-selected': cell.isSelected,
                'is-sun': cell.dayOfWeek === 0,
                'is-sat': cell.dayOfWeek === 6,
              }}
              aria-label={formatSelectedDate(cell.date)}
              aria-pressed={cell.isSelected}
              onClick={() => handleSelectCell(cell)}
            >
              <span class="cal-cell-day">{cell.dayNumber}</span>
            </button>
          )}
        </For>
      </div>

      <footer class="cal-footer">
        <div class="cal-selected-info">
          <span class="cal-selected-label">SELECTED</span>
          <span class="cal-selected-date">{formatSelectedDate(selectedDate())}</span>
        </div>
        <fd.Badge variant={dDayMeta().variant} class="cal-dday-badge">
          {dDayMeta().label}
        </fd.Badge>
      </footer>
    </div>
  );
};

export default AppCalendar;
