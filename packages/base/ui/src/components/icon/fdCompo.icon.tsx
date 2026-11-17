import { Component, JSX, mergeProps, splitProps } from 'solid-js';
import './fdCompo.icon.css';

export type IconSize = 'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Lucide icon name (e.g. 'folder', 'settings', 'terminal', or 'icon-folder') */
  name: string;
  /** Preset size ('inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl') or pixel number */
  size?: IconSize | number;
  /** Continuous spin animation (useful for loading icons like 'loader-2' or 'refresh-cw') */
  spin?: boolean;
  /** Accessible label. If omitted, the icon is treated as decorative (aria-hidden="true") */
  label?: string;
}

export type FdIconSize = IconSize;
export type FdIconProps = IconProps;

export const Icon: Component<IconProps> = (rawProps) => {
  const merged = mergeProps(
    {
      size: 'md' as IconSize | number,
      spin: false,
    },
    rawProps
  );

  const [local, rest] = splitProps(merged, [
    'name',
    'size',
    'spin',
    'label',
    'class',
    'style',
  ]);

  const iconClass = () =>
    local.name.startsWith('icon-') ? local.name : `icon-${local.name}`;

  const sizeClass = () =>
    typeof local.size === 'string' ? `fd-icon--${local.size}` : '';

  const mergedStyle = (): JSX.CSSProperties | string | undefined => {
    if (typeof local.size !== 'number') return local.style;
    const sizePx = `${local.size}px`;
    if (typeof local.style === 'string') {
      return `font-size: ${sizePx}; ${local.style}`;
    }
    return {
      'font-size': sizePx,
      ...(local.style ?? {}),
    };
  };

  return (
    <i
      class={`fd-compo fd-icon ${iconClass()}${sizeClass() ? ` ${sizeClass()}` : ''}${local.spin ? ' fd-icon--spin' : ''}${local.class ? ` ${local.class}` : ''}`}
      style={mergedStyle()}
      role={local.label ? 'img' : undefined}
      aria-label={local.label}
      aria-hidden={local.label ? undefined : 'true'}
      {...rest}
    />
  );
};

export const FdIcon = Icon;
