/**
 * FerdyOS 공용 정적 에셋 경로 및 심볼 상수
 * packages/assets/public/ 하위의 정적 파일은 단일 Vite 서버(:3000)의 루트(/)에서 서빙됩니다.
 */
export const FERDY_ASSETS = {
  logoSymbol: '❖',
  icons: {
    sample: '🧩',
    clock: '🕒',
    rocket: '🚀',
    plus: '➕',
  },
  paths: {
    logoSvg: '/assets/ferdy-logo.svg',
  },
} as const;
