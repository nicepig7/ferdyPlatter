import { FERDY_ASSETS } from '@ferdy/assets';
import type { AppManifest } from '../../types/fdType.app';

/**
 * FerdyOS에 기본 설치된 도메인 애플리케이션 매니페스트(App Manifest) 초기 메타데이터 목록
 * - 규칙: `.meta.ts` 파일은 한 종류의 메타데이터만 관리합니다.
 * - 새로운 도메인 앱(`packages/domains/<app-name>`) 추가 시 이곳에 고유 메타정보를 등록합니다.
 */
export const INITIAL_APP_MANIFESTS: AppManifest[] = [
  {
    appId: 'app-sample',
    title: 'Sample App',
    icon: FERDY_ASSETS.icons.sample,
    tone: 'primary',
    appUrl: '/apps/app-sample/',
    description: 'FerdyOS 표준 샌드박스 도메인 앱 템플릿 및 @ferdy/bridge 통신 예제',
    defaultWindow: {
      width: 640,
      height: 440,
    },
  },
  {
    appId: 'app-clock',
    title: 'Clock',
    icon: FERDY_ASSETS.icons.clock,
    tone: 'secondary',
    appUrl: '/apps/app-clock/',
    description: '실시간 디지털 시계 및 24H/12H 포맷 전환 위젯 앱',
    defaultWindow: {
      x: 780,
      y: 80,
      width: 340,
      height: 230,
    },
  },
  {
    appId: 'app-hello',
    title: 'Hello World',
    icon: FERDY_ASSETS.icons.hello,
    tone: 'neutral',
    appUrl: '/apps/app-hello/',
    description: '최소 구성(Minimal) Hello World 도메인 앱',
    defaultWindow: {
      width: 480,
      height: 360,
    },
  },
];
