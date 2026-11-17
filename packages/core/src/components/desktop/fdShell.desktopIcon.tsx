import { Component, JSX, Show, createUniqueId } from 'solid-js';
import { fd } from '@ferdy/ui';
import type { AppIconTone } from '../../types/fdType.app';
import { getIconToneMeta } from '../../services/app/fdStore.app';
import { AppIcon } from '../common/fdShell.appIcon';
import './fdShell.desktopIcon.css';

export type DesktopIconTone = AppIconTone;

export interface DesktopIconProps {
  /** 아이콘 하단 라벨 및 마우스 오버 툴팁 텍스트 */
  title: string;
  /** SVG 에셋 경로 또는 Lucide 아이콘 이름 */
  icon: string;
  /** 앱 타일(Squircle) 배경 컬러 톤 */
  tone?: DesktopIconTone;
  /** 내부 아이콘 픽셀 크기 (기본값: 32) */
  iconSize?: number;
  /** 외부 웹 사이트 링크 여부 (타일 모서리에 링크 배지 표시) */
  isExternal?: boolean;
  /** 클릭 핸들러 */
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  /** 더블클릭 핸들러 */
  onDblClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

/**
 * 100x100 좌표계 기준 초타원(Superellipse / Apple-style Continuous Corner Squircle) 패스
 * 일반 CSS border-radius와 달리 직선에서 곡선으로 넘어가는 변곡점이 없이 부드럽게 이어집니다.
 */
const SQUIRCLE_FILL_PATH =
  'M 50,1 C 92,1 99,8 99,50 C 99,92 92,99 50,99 C 8,99 1,92 1,50 C 1,8 8,1 50,1 Z';

const SQUIRCLE_HIGHLIGHT_PATH =
  'M 8,12 C 14,3 26,2.2 50,2.2 C 74,2.2 86,3 92,12';

export const DesktopIcon: Component<DesktopIconProps> = (props) => {
  const gradId = createUniqueId();
  const toneMeta = () => getIconToneMeta(props.tone);

  return (
    <button
      type="button"
      class="os-desktop-icon"
      title={props.title}
      onClick={props.onClick}
      onDblClick={props.onDblClick}
    >
      <span
        class={`os-desktop-icon-tile os-desktop-icon-tile--${toneMeta().tone}`}
        style={{
          '--os-tile-fg': toneMeta().fg,
          '--os-tile-grad-start': toneMeta().gradStart,
          '--os-tile-grad-end': toneMeta().gradEnd,
          '--os-tile-border': toneMeta().border,
          '--os-tile-hover-border': toneMeta().hoverBorder,
        }}
      >
        <svg
          class="os-desktop-icon-squircle"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" class="squircle-grad-start" />
              <stop offset="100%" class="squircle-grad-end" />
            </linearGradient>
          </defs>
          {/* 스쿼클 배경 및 외곽 보더 */}
          <path
            class="squircle-body"
            d={SQUIRCLE_FILL_PATH}
            fill={`url(#${gradId})`}
          />
          {/* 상단 인셋 글래스 하이라이트 */}
          <path
            class="squircle-highlight"
            d={SQUIRCLE_HIGHLIGHT_PATH}
            fill="none"
          />
        </svg>

        <span class="os-desktop-icon-glyph">
          <AppIcon icon={props.icon} size={props.iconSize ?? 32} />
        </span>

        <Show when={props.isExternal}>
          <span class="os-desktop-icon-badge" aria-hidden="true">
            <fd.Icon name="external-link" size={10} />
          </span>
        </Show>
      </span>
      <span class="os-desktop-icon-label">{props.title}</span>
    </button>
  );
};
