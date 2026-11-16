import { Component, createSignal } from 'solid-js';

export const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const instanceId = new URLSearchParams(window.location.search).get('instance') ?? '1';

  const sendPingToShell = () => {
    window.parent.postMessage(
      {
        type: 'FERDY_APP_PING',
        instanceId,
        timestamp: new Date().toISOString(),
      },
      '*'
    );
  };

  const requestNewWindowFromShell = () => {
    window.parent.postMessage(
      {
        type: 'FERDY_OPEN_WINDOW',
        title: `Spawned by Instance #${instanceId}`,
        appUrl: `/apps/app-sample/?instance=${Math.floor(Math.random() * 900 + 100)}`,
      },
      '*'
    );
  };

  return (
    <div
      style={{
        'min-height': '100vh',
        margin: 0,
        padding: '24px',
        'box-sizing': 'border-box',
        'font-family': 'Pretendard, system-ui, -apple-system, sans-serif',
        background: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        'flex-direction': 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'border-bottom': '1px solid rgba(148, 163, 184, 0.2)',
          'padding-bottom': '12px',
        }}
      >
        <h2 style={{ margin: 0, 'font-size': '18px', color: '#38bdf8' }}>
          Isolated App Template (#{instanceId})
        </h2>
        <span
          style={{
            'font-size': '12px',
            padding: '4px 8px',
            'border-radius': '999px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
          }}
        >
          iframe sandboxed
        </span>
      </div>

      <p style={{ margin: 0, 'font-size': '14px', color: '#94a3b8', 'line-height': '1.5' }}>
        이 앱은 <code>packages/apps/app-sample</code>에 격리된 패키지이며,
        단일 Vite 서버의 <code>/apps/app-sample/</code> 경로를 통해 <code>iframe</code>으로 온디맨드 로드됩니다.
      </p>

      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          gap: '10px',
          'margin-top': '8px',
          'flex-wrap': 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          style={{
            padding: '8px 14px',
            'border-radius': '8px',
            border: '1px solid #38bdf8',
            background: '#0284c7',
            color: '#ffffff',
            'font-weight': '600',
            cursor: 'pointer',
          }}
        >
          Local State Count: {count()}
        </button>

        <button
          type="button"
          onClick={sendPingToShell}
          style={{
            padding: '8px 14px',
            'border-radius': '8px',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            background: '#1e293b',
            color: '#e2e8f0',
            cursor: 'pointer',
          }}
        >
          Send postMessage to Shell
        </button>

        <button
          type="button"
          onClick={requestNewWindowFromShell}
          style={{
            padding: '8px 14px',
            'border-radius': '8px',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#ddd6fe',
            cursor: 'pointer',
          }}
        >
          Request Shell to Open Window
        </button>
      </div>
    </div>
  );
};

