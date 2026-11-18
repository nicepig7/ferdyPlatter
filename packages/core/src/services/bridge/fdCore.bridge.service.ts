import { FERDY_ASSETS } from '@ferdy/assets';
import { ferdyBridge } from '@ferdy/bridge';
import { appStore } from '../app/fdCore.app.store';
import { windowStore } from '../window/fdCore.window.store';

/**
 * Core 셸에서 도메인 앱(@ferdy/bridge) 이벤트를 수신하는 전역 핸들러를 등록합니다.
 * 반환된 함수를 호출하면 등록된 모든 리스너가 해제됩니다.
 */
export function registerCoreBridgeHandlers(): () => void {
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
      appUrl: payload.appUrl ?? '/domains/sample/app/',
      x: payload.x,
      y: payload.y,
      width: payload.width,
      height: payload.height,
    });
  });

  return () => {
    unsubPing();
    unsubOpen();
  };
}
