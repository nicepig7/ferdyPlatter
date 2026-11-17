import { Component, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import {
  MAX_MEMO_LENGTH,
  MONTH_NAMES,
  type CalendarCell,
} from './common/calendar.types';
import { loadCalendarMemos, saveCalendarMemos } from './common/calendar.storage';
import {
  buildCalendarCells,
  formatSelectedDate,
  getDDayMeta,
  isSameDay,
  normalizeDate,
  toDateKey,
} from './common/calendar.utils';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarFooter } from './components/CalendarFooter';
import './appCalendar.css';

export const AppCalendar: Component = () => {
  const [today, setToday] = createSignal<Date>(normalizeDate(new Date()));
  const [viewDate, setViewDate] = createSignal<Date>(
    new Date(today().getFullYear(), today().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = createSignal<Date>(today());
  const [memos, setMemos] = createSignal<Record<string, string>>(loadCalendarMemos());

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

  const selectedDateKey = createMemo(() => toDateKey(selectedDate()));
  const selectedMemo = createMemo(() => memos()[selectedDateKey()] ?? '');

  const updateSelectedMemo = (rawValue: string) => {
    const value = rawValue.slice(0, MAX_MEMO_LENGTH);
    const key = selectedDateKey();
    setMemos((prev) => {
      const next = { ...prev };
      if (value.trim().length === 0) {
        delete next[key];
      } else {
        next[key] = value;
      }
      saveCalendarMemos(next);
      return next;
    });
  };

  const calendarCells = createMemo<CalendarCell[]>(() =>
    buildCalendarCells({
      year: viewYear(),
      month: viewMonth(),
      today: today(),
      selectedDate: selectedDate(),
      memos: memos(),
    })
  );

  const dDayMeta = createMemo(() => getDDayMeta(selectedDate(), today()));

  return (
    <div class="app-calendar">
      <CalendarHeader
        yearMonth={headerYearMonth()}
        monthName={headerMonthName()}
        onPrevMonth={() => shiftMonth(-1)}
        onToday={jumpToToday}
        onNextMonth={() => shiftMonth(1)}
      />

      <CalendarGrid
        cells={calendarCells()}
        memos={memos()}
        gridAriaLabel={`${headerYearMonth()} 달력`}
        onSelectCell={handleSelectCell}
      />

      <CalendarFooter
        selectedDateLabel={formatSelectedDate(selectedDate())}
        dDayMeta={dDayMeta()}
        memo={selectedMemo()}
        onUpdateMemo={updateSelectedMemo}
      />
    </div>
  );
};

export default AppCalendar;
