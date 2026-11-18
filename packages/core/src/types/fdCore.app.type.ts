export type AppIconTone =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'teal';

/**
 * 바탕화면 아이콘 타일 컬러 톤 메타데이터
 */
export interface AppIconToneMeta {
  /** 톤 식별자 */
  tone: AppIconTone;
  /** 메타데이터 관리용 톤 이름 (추후 UI/설정에서 활용) */
  name: string;
  /** 내부 아이콘(glyph) 전경색 */
  fg: string;
  /** 스쿼클 그라데이션 시작 색 */
  gradStart: string;
  /** 스쿼클 그라데이션 끝 색 */
  gradEnd: string;
  /** 스쿼클 기본 외곽선 색 */
  border: string;
  /** 스쿼클 호버 시 외곽선 색 */
  hoverBorder: string;
}

/**
 * 바로가기/앱 실행 방식
 * - `'window'`: OS 내부 iframe 창으로 실행 (기본값)
 * - `'new-tab'`: 브라우저 새 탭(`window.open`)으로 바로 열기
 */
export type ShortcutOpenMode = 'window' | 'new-tab';

/**
 * 도메인 애플리케이션 분류 카테고리
 * - `'builtin'`: OS 기본 탑재 유틸리티/위젯 앱
 * - `'sample'`: 템플릿, 데모, 샌드박스 테스트용 앱
 */
export type AppCategory = 'builtin' | 'sample';

/**
 * OS에 설치/등록된 도메인 애플리케이션의 고유 메타정보 (App Manifest)
 */
export interface AppManifest {
  /** 도메인 앱 고유 식별자 (예: 'builtin-clock', 'sample-app', 'sample-hello') */
  appId: string;
  /** 도메인 앱 카테고리 */
  category: AppCategory;
  /** 앱 기본 표시 이름 */
  title: string;
  /** 앱 기본 아이콘 (SVG 에셋 경로 또는 Lucide 아이콘 이름) */
  icon: string;
  /** 바탕화면 타일 등 기본 컬러 톤 */
  tone?: AppIconTone;
  /** iframe으로 서빙될 기본 경로 (예: '/domains/sample/app/') */
  appUrl: string;
  /** 앱 설명 (선택) */
  description?: string;
  /** 창 열기 시 적용할 기본 좌표 및 크기 */
  defaultWindow?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  };
}

/**
 * 바탕화면(또는 런처)에 배치되는 바로가기(Shortcut) 항목 정의
 * - `appId`를 통해 등록된 AppManifest의 기본값(title, icon, tone, appUrl, defaultWindow)을 상속받으며,
 *   바로가기별로 개별 속성이나 쿼리 파라미터(`queryParams`)를 오버라이드할 수 있습니다.
 */
export interface DesktopShortcut {
  /** 바로가기 고유 ID (창 열기 시 기본 창 인스턴스 ID로도 사용됨) */
  id: string;
  /** 연결할 등록 앱 식별자 (예: 'sample-app') */
  appId?: string;
  /** 바로가기 라벨 및 창 제목 오버라이드 (생략 시 AppManifest.title 사용) */
  title?: string;
  /** 아이콘 오버라이드 (생략 시 AppManifest.icon 사용) */
  icon?: string;
  /** 타일 컬러 톤 오버라이드 (생략 시 AppManifest.tone 사용) */
  tone?: AppIconTone;
  /** 직접 URL을 지정하거나 오버라이드할 때 사용 (생략 시 AppManifest.appUrl 사용) */
  appUrl?: string;
  /** 실행 방식 ('window': OS 내부 창, 'new-tab': 브라우저 새 탭. 기본값: 'window') */
  openMode?: ShortcutOpenMode;
  /** 앱 URL 뒤에 부착할 쿼리 파라미터 (예: { instance: 2 } -> '?instance=2') */
  queryParams?: Record<string, string | number>;
  /** 초기 X 좌표 오버라이드 */
  x?: number;
  /** 초기 Y 좌표 오버라이드 */
  y?: number;
  /** 초기 창 너비 오버라이드 */
  width?: number;
  /** 초기 창 높이 오버라이드 */
  height?: number;
  /** 최소 창 너비 오버라이드 */
  minWidth?: number;
  /** 최소 창 높이 오버라이드 */
  minHeight?: number;
}

/**
 * 등록된 앱(또는 바로가기)을 실행할 때 전달하는 옵션
 */
export interface LaunchAppOptions {
  /** 창 인스턴스 고유 ID (생략 시 appId 또는 자동 생성 ID 사용) */
  windowId?: string;
  /** 창 제목 오버라이드 */
  title?: string;
  /** 창 아이콘 오버라이드 */
  icon?: string;
  /** 직접 지정할 URL 오버라이드 */
  appUrl?: string;
  /** 실행 방식 ('window': OS 내부 창, 'new-tab': 브라우저 새 탭. 기본값: 'window') */
  openMode?: ShortcutOpenMode;
  /** 앱 URL에 추가할 쿼리 스트링 파라미터 (예: { instance: 2 }) */
  queryParams?: Record<string, string | number>;
  /** 초기 X 좌표 오버라이드 */
  x?: number;
  /** 초기 Y 좌표 오버라이드 */
  y?: number;
  /** 초기 창 너비 오버라이드 */
  width?: number;
  /** 초기 창 높이 오버라이드 */
  height?: number;
  /** 최소 창 너비 오버라이드 */
  minWidth?: number;
  /** 최소 창 높이 오버라이드 */
  minHeight?: number;
}
