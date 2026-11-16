import { Component, JSX, splitProps } from 'solid-js';
import './fdCompo.card.css';

export type CardProps = JSX.HTMLAttributes<HTMLDivElement>;
export type FdCardProps = CardProps;

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div class={`fd-card${local.class ? ` ${local.class}` : ''}`} {...rest}>
      {local.children}
    </div>
  );
};

export const FdCard = Card;
