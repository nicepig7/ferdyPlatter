import { Component, Show } from 'solid-js';
import { fd, type FdIconSize } from '@ferdy/ui';
import './AppIcon.css';

export interface AppIconProps {
  /** SVG 에셋 경로 ('/assets/...svg') 또는 Lucide 아이콘 이름 ('clock', 'rocket' 등) */
  icon: string;
  /** Lucide 아이콘 크기 또는 SVG 픽셀 크기 */
  size?: FdIconSize | number;
  /** 추가 클래스명 */
  class?: string;
}

export const isSvgAssetPath = (icon: string): boolean =>
  icon.startsWith('/') || icon.endsWith('.svg') || icon.startsWith('http');

export const AppIcon: Component<AppIconProps> = (props) => {
  const pixelSize = () => {
    if (typeof props.size === 'number') return `${props.size}px`;
    switch (props.size) {
      case 'xs':
        return '14px';
      case 'sm':
        return '16px';
      case 'lg':
        return '24px';
      case 'xl':
        return '30px';
      default:
        return '20px';
    }
  };

  return (
    <Show
      when={isSvgAssetPath(props.icon)}
      fallback={
        <fd.Icon
          name={props.icon}
          size={props.size ?? 'lg'}
          class={props.class}
        />
      }
    >
      <img
        src={props.icon}
        alt=""
        draggable={false}
        class={`os-app-icon-img${props.class ? ` ${props.class}` : ''}`}
        style={{
          width: pixelSize(),
          height: pixelSize(),
        }}
      />
    </Show>
  );
};
