import { Component, onCleanup, onMount } from 'solid-js';
import { Desktop } from './components/Desktop';
import { Taskbar } from './components/Taskbar';
import { windowStore } from './store/windowStore';

export const App: Component = () => {
  // 자식 iframe 앱(packages/apps/*)からの postMessage 수신 브릿지 예시
  const handleAppMessage = (event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'object') return;

    if (event.data.type === 'FERDY_APP_PING') {
      console.log('[Shell] Received message from isolated app:', event.data);
    }
    if (event.data.type === 'FERDY_OPEN_WINDOW') {
      windowStore.openWindow({
        title: event.data.title ?? 'Spawned from App',
        appUrl: event.data.appUrl ?? '/apps/app-sample/',
      });
    }
  };

  onMount(() => {
    window.addEventListener('message', handleAppMessage);
  });

  onCleanup(() => {
    window.removeEventListener('message', handleAppMessage);
  });

  return (
    <div class="os-shell-root">
      <Desktop />
      <Taskbar />
    </div>
  );
};

