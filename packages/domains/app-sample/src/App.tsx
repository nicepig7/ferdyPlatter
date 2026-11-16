import { Component, createSignal } from 'solid-js';
import { ferdyBridge } from '@ferdy/bridge';
import { Badge, Button } from '@ferdy/ui';

export const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const instanceId = new URLSearchParams(window.location.search).get('instance') ?? '1';

  const sendPingToCore = () => {
    ferdyBridge.ping(instanceId);
  };

  const requestNewWindowFromCore = () => {
    ferdyBridge.openWindow({
      title: `Spawned by Instance #${instanceId}`,
      appUrl: `/apps/app-sample/?instance=${Math.floor(Math.random() * 900 + 100)}`,
    });
  };

  return (
    <div class="f-app-shell">
      <header class="f-app-header">
        <h2 class="f-app-title">Isolated App Template (#{instanceId})</h2>
        <Badge variant="accent">iframe sandboxed</Badge>
      </header>

      <p
        style={{
          'font-size': '14px',
          color: 'var(--ferdy-text-muted)',
          'line-height': '1.5',
        }}
      >
        이 앱은 <code>packages/domains/app-sample</code>에 격리된 도메인 패키지이며,{' '}
        <code>@ferdy/ui</code> 디자인 시스템과 <code>@ferdy/bridge</code> 이벤트 버스를 통해
        단일한 Look &amp; Feel과 통신을 공유합니다.
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
        <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
          Local State Count: {count()}
        </Button>

        <Button variant="secondary" onClick={sendPingToCore}>
          Send Ping via @ferdy/bridge
        </Button>

        <Button variant="purple" onClick={requestNewWindowFromCore}>
          Request Core to Open Window
        </Button>
      </div>
    </div>
  );
};
