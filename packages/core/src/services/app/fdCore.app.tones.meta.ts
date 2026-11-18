import type { AppIconToneMeta } from '../../types/fdCore.app.type';

/**
 * 바탕화면 아이콘 타일에 사용할 프리셋 컬러 톤(Color Tones) 초기 메타데이터 목록
 * - 규칙: `.meta.ts` 파일은 한 종류의 메타데이터만 관리합니다.
 * - `tone` 식별자와 별도로 `name` 필드에 표시/관리용 이름을 입력해둘 수 있습니다.
 */
export const INITIAL_APP_ICON_TONES: AppIconToneMeta[] = [
  {
    tone: 'neutral',
    name: 'Charcoal',
    fg: 'var(--fd-text-secondary)',
    gradStart: 'rgba(48, 39, 34, 0.94)',
    gradEnd: 'rgba(20, 16, 14, 0.96)',
    border: 'var(--fd-border-strong)',
    hoverBorder: 'rgba(246, 241, 234, 0.42)',
  },
  {
    tone: 'primary',
    name: 'Terracotta',
    fg: 'var(--fd-primary)',
    gradStart: 'rgba(88, 49, 26, 0.92)',
    gradEnd: 'rgba(28, 22, 18, 0.96)',
    border: 'var(--fd-primary-border)',
    hoverBorder: 'var(--fd-primary-focus)',
  },
  {
    tone: 'secondary',
    name: 'Forest Green',
    fg: 'var(--fd-secondary-text)',
    gradStart: 'rgba(39, 68, 52, 0.92)',
    gradEnd: 'rgba(22, 26, 23, 0.96)',
    border: 'var(--fd-secondary-border)',
    hoverBorder: 'var(--fd-secondary-focus)',
  },
  {
    tone: 'blue',
    name: 'Ocean Blue',
    fg: '#74b3f0',
    gradStart: 'rgba(30, 58, 92, 0.92)',
    gradEnd: 'rgba(17, 23, 32, 0.96)',
    border: 'rgba(116, 179, 240, 0.45)',
    hoverBorder: 'rgba(116, 179, 240, 0.72)',
  },
  {
    tone: 'amber',
    name: 'Warm Amber',
    fg: '#eab354',
    gradStart: 'rgba(88, 62, 22, 0.92)',
    gradEnd: 'rgba(28, 23, 16, 0.96)',
    border: 'rgba(234, 179, 84, 0.45)',
    hoverBorder: 'rgba(234, 179, 84, 0.72)',
  },
  {
    tone: 'rose',
    name: 'Vintage Rose',
    fg: '#e87d7d',
    gradStart: 'rgba(86, 36, 42, 0.92)',
    gradEnd: 'rgba(28, 18, 20, 0.96)',
    border: 'rgba(232, 125, 125, 0.45)',
    hoverBorder: 'rgba(232, 125, 125, 0.72)',
  },
  {
    tone: 'violet',
    name: 'Dusty Violet',
    fg: '#b594e8',
    gradStart: 'rgba(58, 42, 86, 0.92)',
    gradEnd: 'rgba(22, 18, 30, 0.96)',
    border: 'rgba(181, 148, 232, 0.45)',
    hoverBorder: 'rgba(181, 148, 232, 0.72)',
  },
  {
    tone: 'teal',
    name: 'Deep Teal',
    fg: '#63c7be',
    gradStart: 'rgba(26, 68, 68, 0.92)',
    gradEnd: 'rgba(16, 25, 25, 0.96)',
    border: 'rgba(99, 199, 190, 0.45)',
    hoverBorder: 'rgba(99, 199, 190, 0.72)',
  },
];
