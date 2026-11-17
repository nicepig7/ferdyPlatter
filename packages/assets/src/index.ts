/**
 * FerdyOS 공용 정적 에셋 경로 및 아이콘 상수
 * packages/assets/public/ 하위의 정적 파일은 단일 Vite 서버(:3000)의 루트(/)에서 서빙됩니다.
 *
 * 아이콘 규격:
 * - '/' 또는 '.svg'로 시작/끝나는 문자열: 정적 SVG 이미지 경로
 * - 그 외 문자열: @ferdy/ui의 Lucide 아이콘 이름 (<fd.Icon name="..." />)
 */
export const FERDY_ASSETS = {
  logoSymbol: '❖',
  icons: {
    sample: '/assets/icons/app-sample.svg',
    clock: 'clock',
    rocket: 'rocket',
    plus: 'plus',
    hello: 'hand',
  },
  paths: {
    logoSvg: '/assets/logo/ferdy.svg',
    sampleIconSvg: '/assets/icons/app-sample.svg',
  },
} as const;
