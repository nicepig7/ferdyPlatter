export type WindowSnapZone = 'left' | 'right' | 'top';

export interface WindowRestoreRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInstance {
  /** 고유 창 식별자 */
  id: string;
  /** 연결된 도메인 앱 식별자 (등록된 앱에서 실행된 경우) */
  appId?: string;
  /** 창 상단 타이틀바 및 태스크바에 표시될 제목 */
  title: string;
  /** 내부 iframe으로 격리 실행할 앱의 URL */
  appUrl: string;
  /** 창 아이콘 (SVG 에셋 경로 또는 Lucide 아이콘 이름) */
  icon?: string;
  /** X 좌표 (px) */
  x: number;
  /** Y 좌표 (px) */
  y: number;
  /** 창 너비 (px) */
  width: number;
  /** 창 높이 (px) */
  height: number;
  /** 최소 창 너비 (px, 미지정 시 OS 기본값 사용) */
  minWidth?: number;
  /** 최소 창 높이 (px, 미지정 시 OS 기본값 사용) */
  minHeight?: number;
  /** 쌓임 순서 (클수록 상단에 위치) */
  zIndex: number;
  /** 현재 활성(포커스) 상태 여부 */
  isFocused: boolean;
  /** 태스크바로 최소화되었는지 여부 */
  isMinimized: boolean;
  /** 전체화면 최대화 여부 */
  isMaximized: boolean;
  /** 현재 창 분할 스냅 상태 (좌/우 50% 스냅 여부) */
  snapZone?: 'left' | 'right' | null;
  /** 스냅 또는 최대화 이전의 원래 창 좌표 및 크기 */
  restoreRect?: WindowRestoreRect;
  /** 도메인 앱 브릿지 신호로 활성화된 창 로딩 상태 여부 (런타임 상태) */
  isLoading?: boolean;
  /** 창 로딩 오버레이에 표시할 커스텀 안내 문구 */
  loadingMessage?: string;
}

export interface CreateWindowPayload {
  id?: string;
  appId?: string;
  title: string;
  appUrl?: string;
  icon?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface ReplaceWindowPayload {
  appId?: string;
  title: string;
  appUrl: string;
  icon?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface WindowViewportSize {
  width: number;
  height: number;
}

export interface WindowStoreState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
  isInteracting: boolean;
  snapPreview: WindowSnapZone | null;
}

export interface InitialWindowSession {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
}
