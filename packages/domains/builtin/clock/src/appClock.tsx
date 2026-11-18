import { Component, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { fd } from '@ferdy/ui';
import './appClock.css';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const AppClock: Component = () => {
  const [now, setNow] = createSignal(new Date());
  const [is24Hour, setIs24Hour] = createSignal(true);

  onMount(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    onCleanup(() => {
      window.clearInterval(timer);
    });
  });

  const formattedTime = () => {
    const date = now();
    const hours24 = date.getHours();
    const hours = is24Hour() ? hours24 : hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  };

  const meridiem = () => (now().getHours() >= 12 ? 'PM' : 'AM');

  const formattedDate = () => {
    const date = now();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const day = DAYS[date.getDay()];
    return `${yyyy}-${mm}-${dd}(${day})`;
  };

  return (
    <div class="app-clock">
      <div class="app-clock-header">
        <span class="app-clock-date">{formattedDate()}</span>
        <fd.Button
          variant="accent-ghost"
          size="sm"
          class="app-clock-toggle"
          onClick={() => setIs24Hour((prev) => !prev)}
        >
          {is24Hour() ? '24H' : '12H'}
        </fd.Button>
      </div>

      <div class="app-clock-body">
        <Show when={!is24Hour()}>
          <span class="app-clock-meridiem">{meridiem()}</span>
        </Show>
        <span class="app-clock-time">{formattedTime()}</span>
      </div>

      <div class="app-clock-footer">
        <span>Local Time</span>
        <span>@ferdy/builtin-clock</span>
      </div>
    </div>
  );
};
