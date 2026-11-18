import { Component } from 'solid-js';
import { fd } from '@ferdy/ui';
import { MAX_MEMO_LENGTH, type DDayMeta } from '../common/calendar.types';
import './CalendarFooter.css';

export interface CalendarFooterProps {
  selectedDateLabel: string;
  dDayMeta: DDayMeta;
  memo: string;
  onUpdateMemo: (value: string) => void;
}

export const CalendarFooter: Component<CalendarFooterProps> = (props) => {
  return (
    <footer class="cal-footer">
      <div class="cal-footer-top">
        <div class="cal-selected-info">
          <span class="cal-selected-label">SELECTED</span>
          <span class="cal-selected-date">{props.selectedDateLabel}</span>
        </div>
        <fd.Badge variant={props.dDayMeta.variant} class="cal-dday-badge">
          {props.dDayMeta.label}
        </fd.Badge>
      </div>

      <fd.TextField
        size="sm"
        leftIcon="pencil"
        clearLabel="메모 지우기"
        containerClass="cal-memo-field"
        class="cal-memo-input"
        placeholder="선택한 날짜에 한 줄 메모..."
        aria-label="선택한 날짜 한 줄 메모"
        maxLength={MAX_MEMO_LENGTH}
        value={props.memo}
        onInput={(e) => props.onUpdateMemo(e.currentTarget.value)}
        onClear={() => props.onUpdateMemo('')}
        onBlur={(e) => {
          const trimmed = e.currentTarget.value.trim();
          props.onUpdateMemo(trimmed);
          e.currentTarget.value = trimmed;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
    </footer>
  );
};
