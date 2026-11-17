import { Component, onCleanup, onMount } from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { ferdyBridge } from '@ferdy/bridge';
import { Desktop } from './components/desktop/fdShell.desktop';
import { Taskbar } from './components/taskbar/fdShell.taskbar';
import { appStore } from './services/app/fdStore.app';
import { windowStore } from './services/window/fdStore.window';

export const App: Component = () => {
  onMount(() => {
    const unsubPing = ferdyBridge.on('FERDY_APP_PING', (payload) => {
      console.log('[Core] Received ping from isolated domain app:', payload);
    });

    const unsubOpen = ferdyBridge.on('FERDY_OPEN_WINDOW', (payload) => {
      if (payload.appId) {
        appStore.launchApp(payload.appId, {
          windowId: payload.id ?? `${payload.appId}-${Date.now()}`,
          title: payload.title,
          icon: payload.icon,
          appUrl: payload.appUrl,
          queryParams: payload.queryParams,
          x: payload.x,
          y: payload.y,
          width: payload.width,
          height: payload.height,
        });
        return;
      }

      windowStore.openWindow({
        id: payload.id,
        title: payload.title ?? 'Spawned from App',
        icon: payload.icon ?? FERDY_ASSETS.paths.sampleIconSvg,
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
