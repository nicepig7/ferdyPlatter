import type { DesktopShortcut } from '../../types/fdCore.app.type';

/**
 * 바탕화면에 기본 배치되는 바로가기 아이콘(Desktop Shortcuts) 초기 메타데이터 목록
 * - 규칙: `.meta.ts` 파일은 한 종류의 메타데이터만 관리합니다.
 * - `appId`를 통해 `fdCore.app.manifest.meta.ts`에 등록된 앱의 기본 메타정보를 참조하며,
 *   바로가기별로 제목, 아이콘, 쿼리 파라미터(`queryParams`), 창 위치/크기를 오버라이드할 수 있습니다.
 */
export const INITIAL_DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  {
    id: 'sample-app-1',
    appId: 'sample-app',
  },
  {
    id: 'builtin-clock-1',
    appId: 'builtin-clock',
  },
  {
    id: 'sample-hello-1',
    appId: 'sample-hello',
  },
  {
    id: 'sample-components-1',
    appId: 'sample-components',
  },
  {
    id: 'builtin-calendar-1',
    appId: 'builtin-calendar',
  },
  {
    id: 'builtin-notes-1',
    appId: 'builtin-notes',
  },
  {
    id: 'work-task-react-1',
    appId: 'work-task-react',
  },
  {
    id: 'work-task-vue-1',
    appId: 'work-task-vue',
  },
  {
    id: 'ext-cube-timer',
    title: 'Cube Timer',
    icon: 'timer',
    tone: 'violet',
    appUrl: 'https://nicepig7.github.io/cubeTimer/',
    width: 960,
    height: 640,
  },
];
