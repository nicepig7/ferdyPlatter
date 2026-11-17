import { Component, JSX, mergeProps, splitProps } from 'solid-js';
import './fdCompo.input.css';

export type InputVariant = 'default' | 'ghost';
export type InputSize = 'sm' | 'md';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  size?: InputSize;
}

export type FdInputVariant = InputVariant;
export type FdInputSize = InputSize;
export type FdInputProps = InputProps;

export const Input: Component<InputProps> = (rawProps) => {
  const merged = mergeProps(
    {
      type: 'text' as const,
      variant: 'default' as InputVariant,
      size: 'md' as InputSize,
    },
    rawProps
  );
  const [local, rest] = splitProps(merged, ['variant', 'size', 'class']);

  return (
    <input
      class={`fd-compo fd-input fd-input--${local.variant} fd-input--${local.size}${local.class ? ` ${local.class}` : ''}`}
      {...rest}
    />
  );
};

export const FdInput = Input;
