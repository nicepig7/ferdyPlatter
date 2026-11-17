import { Component, onCleanup, onMount } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { ferdyBridge } from '@ferdy/bridge';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { windowStore } from './store/windowStore';

export const App: Component = () => {
  onMount(() => {
    const unsubPing = ferdyBridge.on('FERDY_APP_PING', (payload) => {
      console.log('[Core] Received ping from isolated domain app:', payload);
    });

    const unsubOpen = ferdyBridge.on('FERDY_OPEN_WINDOW', (payload) => {
      windowStore.openWindow({
        id: payload.id,
        title: payload.title ?? 'Spawned from App',
        icon: FERDY_ASSETS.icons.sample,
        appUrl: payload.appUrl ?? '/apps/app-sample/',
        x: payload.x,
        y: payload.y,
        width: payload.width,
        height: payload.height,
      });
    });

    onCleanup(() => {
      unsubPing();
      unsubOpen();
    });
  });

  return (
    <div class="os-shell-root">
      <Desktop />
      <Taskbar />
    </div>
  );
};
