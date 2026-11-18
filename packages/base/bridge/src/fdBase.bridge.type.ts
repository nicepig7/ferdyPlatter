/**
 * FerdyOS Core ↔ Domain Apps 간 postMessage 이벤트 페이로드 규격
 */
export interface FerdyEventMap {
  /** 자식 앱이 정상 동작 중임을 알리는 핑 이벤트 */
  FERDY_APP_PING: {
    instanceId: string;
    timestamp: string;
  };
  /** 자식 앱에서 Core에게 새로운 창 생성을 요청하는 이벤트 */
  FERDY_OPEN_WINDOW: {
    id?: string;
    appId?: string;
    title?: string;
    appUrl?: string;
    icon?: string;
    queryParams?: Record<string, string | number>;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  /** Core에서 모든 자식 앱으로 테마 변경을 알리는 브로드캐스트 이벤트 */
  FERDY_THEME_CHANGE: {
    theme: 'dark' | 'light';
  };
  /** 자식 앱에서 자신이 속한 부모 창(또는 지정한 windowId)의 로딩 오버레이 표시 여부를 제어하는 이벤트 */
  FERDY_SET_WINDOW_LOADING: {
    loading: boolean;
    message?: string;
    windowId?: string;
  };
}

export type FerdyEventType = keyof FerdyEventMap;

export type FerdyMessage<K extends FerdyEventType = FerdyEventType> = {
  type: K;
} & FerdyEventMap[K];

export type FerdyEventHandler<K extends FerdyEventType> = (
  payload: FerdyEventMap[K],
  rawEvent: MessageEvent
) => void;
