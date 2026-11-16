import { Component, Show, createSignal, onCleanup, onMount } from 'solid-js';

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
        margin: 0,
        padding: '14px 18px',
        'box-sizing': 'border-box',
        'font-family': 'Pretendard, system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
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
            color: '#94a3b8',
            'font-weight': '600',
            'font-variant-numeric': 'tabular-nums',
            'letter-spacing': '0.02em',
            'white-space': 'nowrap',
          }}
        >
          {formattedDate()}
        </span>
        <button
          type="button"
          onClick={() => setIs24Hour((prev) => !prev)}
          style={{
            padding: '4px 9px',
            'font-size': 'clamp(11px, min(3.4vw, 6.5vh), 16px)',
            'font-weight': '600',
            'border-radius': '6px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            background: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            cursor: 'pointer',
            'flex-shrink': '0',
          }}
        >
          {is24Hour() ? '24H' : '12H'}
        </button>
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
              color: '#38bdf8',
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
            color: '#f8fafc',
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
          color: '#64748b',
          'border-top': '1px solid rgba(148, 163, 184, 0.15)',
          'padding-top': '8px',
        }}
      >
        <span>Local Time</span>
        <span>@ferdy/app-clock</span>
      </div>
    </div>
  );
};

