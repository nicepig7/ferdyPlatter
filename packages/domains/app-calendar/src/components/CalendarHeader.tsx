import { Component } from 'solid-js';
import { fd } from '@ferdy/ui';
import './CalendarHeader.css';

export interface CalendarHeaderProps {
  yearMonth: string;
  monthName: string;
  onPrevMonth: () => void;
  onToday: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: Component<CalendarHeaderProps> = (props) => {
  return (
    <header class="cal-header">
      <div class="cal-title-group">
        <fd.Icon name="calendar" size="md" class="cal-title-icon" />
        <div class="cal-title-text">
          <span class="cal-year-month">{props.yearMonth}</span>
          <span class="cal-month-name">{props.monthName}</span>
        </div>
      </div>

      <div class="cal-nav-group">
        <fd.Button
          variant="neutral"
          size="sm"
          class="cal-nav-btn"
          aria-label="이전 달"
          title="이전 달"
          onClick={props.onPrevMonth}
        >
          <fd.Icon name="chevron-left" size="sm" />
        </fd.Button>
        <fd.Button variant="accent-ghost" size="sm" onClick={props.onToday}>
          Today
        </fd.Button>
        <fd.Button
          variant="neutral"
          size="sm"
          class="cal-nav-btn"
          aria-label="다음 달"
          title="다음 달"
          onClick={props.onNextMonth}
        >
          <fd.Icon name="chevron-right" size="sm" />
        </fd.Button>
      </div>
    </header>
  );
};
