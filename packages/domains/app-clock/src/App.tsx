import { Component, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { Button } from '@ferdy/ui';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const App: Component = () => {
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
    <div
      style={{
        height: '100vh',
        padding: '14px 18px',
        background: 'var(--ferdy-bg-gradient-surface)',
        color: 'var(--ferdy-text-primary)',
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'space-between',
        'user-select': 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: '8px',
        }}
      >
        <span
          style={{
            'font-size': 'clamp(14px, min(4.8vw, 9vh), 28px)',
            color: 'var(--ferdy-text-muted)',
            'font-weight': '600',
            'font-variant-numeric': 'tabular-nums',
            'letter-spacing': '0.02em',
            'white-space': 'nowrap',
          }}
        >
          {formattedDate()}
        </span>
        <Button
          variant="accent-ghost"
          size="sm"
          onClick={() => setIs24Hour((prev) => !prev)}
          style={{
            'font-size': 'clamp(11px, min(3.4vw, 6.5vh), 16px)',
            'flex-shrink': '0',
          }}
        >
          {is24Hour() ? '24H' : '12H'}
        </Button>
      </div>

      <div
        style={{
          flex: '1',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '8px',
          'min-height': '0',
        }}
      >
        <Show when={!is24Hour()}>
          <span
            style={{
              'font-size': 'clamp(14px, min(4.5vw, 10vh), 32px)',
              'font-weight': '700',
              color: 'var(--ferdy-accent)',
              'letter-spacing': '0.05em',
              'align-self': 'baseline',
            }}
          >
            {meridiem()}
          </span>
        </Show>
        <span
          style={{
            'font-size': 'clamp(36px, min(17vw, 38vh), 140px)',
            'font-weight': '700',
            'font-variant-numeric': 'tabular-nums',
            'letter-spacing': '0.02em',
            'line-height': '1',
            color: 'var(--ferdy-text-primary)',
            'text-shadow': '0 2px 12px rgba(56, 189, 248, 0.25)',
            'white-space': 'nowrap',
          }}
        >
          {formattedTime()}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'font-size': '11px',
          color: 'var(--ferdy-text-dim)',
          'border-top': '1px solid var(--ferdy-border-subtle)',
          'padding-top': '8px',
        }}
      >
        <span>Local Time</span>
        <span>@ferdy/app-clock</span>
      </div>
    </div>
  );
};
