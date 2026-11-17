export interface WindowInstance {
  /** 고유 창 식별자 */
  id: string;
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
  /** 쌓임 순서 (클수록 상단에 위치) */
  zIndex: number;
  /** 현재 활성(포커스) 상태 여부 */
  isFocused: boolean;
  /** 태스크바로 최소화되었는지 여부 */
  isMinimized: boolean;
  /** 전체화면 최대화 여부 */
  isMaximized: boolean;
}

export interface CreateWindowPayload {
  id?: string;
  title: string;
  appUrl: string;
  icon?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
