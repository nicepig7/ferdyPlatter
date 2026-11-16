import {
  FerdyEventHandler,
  FerdyEventMap,
  FerdyEventType,
  isFerdyMessage,
} from './protocol';

/**
 * 자식 Domain App에서 부모 Core(또는 현재 창)로 이벤트를 발행(Publish)합니다.
 */
function emit<K extends FerdyEventType>(
  type: K,
  payload: FerdyEventMap[K],
  targetOrigin = '*'
): void {
  const targetWindow = window.parent ?? window;
  targetWindow.postMessage(
    {
      type,
      ...payload,
    },
    targetOrigin
  );
}

/**
 * 부모 Core에서 현재 열려 있는 모든 자식 iframe 창으로 이벤트를 브로드캐스트합니다.
 */
function broadcast<K extends FerdyEventType>(
  type: K,
  payload: FerdyEventMap[K],
  iframeSelector = 'iframe.os-window-iframe'
): void {
  const frames = document.querySelectorAll<HTMLIFrameElement>(iframeSelector);
  const message = {
    type,
    ...payload,
  };
  frames.forEach((frame) => {
    frame.contentWindow?.postMessage(message, '*');
  });
}

/**
 * 특정 FERDY_* 이벤트를 구독(Subscribe)하고, 해제(Unsubscribe) 함수를 반환합니다.
 * SolidJS의 onCleanup(ferdyBridge.on(...)) 형태로 바로 사용할 수 있습니다.
 */
function on<K extends FerdyEventType>(
  type: K,
  handler: FerdyEventHandler<K>
): () => void {
  const listener = (event: MessageEvent) => {
    if (!isFerdyMessage(event.data)) return;
    if (event.data.type !== type) return;

    const { type: _ignored, ...payload } = event.data;
    handler(payload as unknown as FerdyEventMap[K], event);
  };

  window.addEventListener('message', listener);
  return () => {
    window.removeEventListener('message', listener);
  };
}

/**
 * 편의 헬퍼: 자식 앱에서 Core로 Ping 전송
 */
function ping(instanceId: string): void {
  emit('FERDY_APP_PING', {
    instanceId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 편의 헬퍼: 자식 앱에서 Core에게 새 창 열기 요청
 */
function openWindow(payload: FerdyEventMap['FERDY_OPEN_WINDOW']): void {
  emit('FERDY_OPEN_WINDOW', payload);
}

export * from './protocol';

export const ferdyBridge = {
  emit,
  broadcast,
  on,
  ping,
  openWindow,
};
