import { FERDY_ASSETS } from '@ferdy/assets';
import type { DesktopShortcut } from '../../types/fdType.app';

/**
 * 바탕화면에 기본 배치되는 바로가기 아이콘(Desktop Shortcuts) 초기 메타데이터 목록
 * - 규칙: `.meta.ts` 파일은 한 종류의 메타데이터만 관리합니다.
 * - `appId`를 통해 `fdRegist.apps.manifest.meta.ts`에 등록된 앱의 기본 메타정보를 참조하며,
 *   바로가기별로 제목, 아이콘, 쿼리 파라미터(`queryParams`), 창 위치/크기를 오버라이드할 수 있습니다.
 */
export const INITIAL_DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  {
    id: 'sample-app-1',
    appId: 'app-sample',
  },
  {
    id: 'clock-app-1',
    appId: 'app-clock',
  },
  {
    id: 'sample-app-2',
    appId: 'app-sample',
    title: 'Second Instance',
    icon: FERDY_ASSETS.icons.rocket,
    tone: 'primary',
    queryParams: { instance: 2 },
  },
  {
    id: 'app-hello',
    appId: 'app-hello',
  },
  {
    id: 'calendar-app-1',
    appId: 'app-calendar',
  },
  {
    id: 'ext-cube-timer',
    title: 'Cube Timer',
    icon: FERDY_ASSETS.icons.timer,
    tone: 'secondary',
    appUrl: 'https://nicepig7.github.io/cubeTimer/',
    width: 960,
    height: 640,
  },
];
