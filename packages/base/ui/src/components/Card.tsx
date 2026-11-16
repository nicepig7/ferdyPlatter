import { Component, JSX, splitProps } from 'solid-js';

export type CardProps = JSX.HTMLAttributes<HTMLDivElement>;

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div class={`f-card${local.class ? ` ${local.class}` : ''}`} {...rest}>
      {local.children}
    </div>
  );
};
