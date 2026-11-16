import { Component, JSX, mergeProps, splitProps } from 'solid-js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent-ghost'
  | 'purple'
  | 'danger';

export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: Component<ButtonProps> = (rawProps) => {
  const merged = mergeProps(
    {
      type: 'button' as const,
      variant: 'primary' as ButtonVariant,
      size: 'md' as ButtonSize,
    },
    rawProps
  );
  const [local, rest] = splitProps(merged, ['variant', 'size', 'class', 'children']);

  return (
    <button
      class={`f-btn f-btn--${local.variant} f-btn--${local.size}${local.class ? ` ${local.class}` : ''}`}
      {...rest}
    >
      {local.children}
    </button>
  );
};
