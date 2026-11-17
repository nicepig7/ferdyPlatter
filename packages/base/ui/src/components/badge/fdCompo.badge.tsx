import { Component, JSX, mergeProps, splitProps } from 'solid-js';
import './fdCompo.badge.css';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'neutral' | 'purple';

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export type FdBadgeVariant = BadgeVariant;
export type FdBadgeProps = BadgeProps;

export const Badge: Component<BadgeProps> = (rawProps) => {
  const merged = mergeProps({ variant: 'accent' as BadgeVariant }, rawProps);
  const [local, rest] = splitProps(merged, ['variant', 'class', 'children']);

  return (
    <span
      class={`fd-compo fd-badge fd-badge--${local.variant}${local.class ? ` ${local.class}` : ''}`}
      {...rest}
    >
      {local.children}
    </span>
  );
};

export const FdBadge = Badge;
