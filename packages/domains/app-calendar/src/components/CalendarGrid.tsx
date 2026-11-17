import { Component, For } from 'solid-js';
import { WEEKDAYS, type CalendarCell } from '../common/calendar.types';
import { formatSelectedDate } from '../common/calendar.utils';
import './CalendarGrid.css';

export interface CalendarGridProps {
  cells: CalendarCell[];
  memos: Record<string, string>;
  gridAriaLabel: string;
  onSelectCell: (cell: CalendarCell) => void;
}

export const CalendarGrid: Component<CalendarGridProps> = (props) => {
  return (
    <>
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

      <div class="cal-grid" role="grid" aria-label={props.gridAriaLabel}>
        <For each={props.cells}>
          {(cell) => (
            <button
              type="button"
              class="cal-cell"
              classList={{
                'is-other-month': !cell.isCurrentMonth,
                'is-today': cell.isToday,
                'is-selected': cell.isSelected,
                'has-memo': cell.hasMemo,
                'is-sun': cell.dayOfWeek === 0,
                'is-sat': cell.dayOfWeek === 6,
              }}
              aria-label={
                cell.hasMemo
                  ? `${formatSelectedDate(cell.date)} - ${props.memos[cell.dateKey]}`
                  : formatSelectedDate(cell.date)
              }
              aria-pressed={cell.isSelected}
              title={props.memos[cell.dateKey] || undefined}
              onClick={() => props.onSelectCell(cell)}
            >
              <span class="cal-cell-day">{cell.dayNumber}</span>
            </button>
          )}
        </For>
      </div>
    </>
  );
};
