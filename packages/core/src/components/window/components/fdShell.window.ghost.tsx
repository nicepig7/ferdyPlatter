import { Component, createEffect, createSignal } from 'solid-js';
import { windowStore } from '../../../services/window/fdCore.window.store';
import type { WindowSnapZone } from '../../../types/fdCore.window.type';

const SNAP_ZONE_LABELS: Record<WindowSnapZone, string> = {
  left: 'Left Split · 50%',
  right: 'Right Split · 50%',
  top: 'Maximize · 100%',
};

export const WindowSnapGhost: Component = () => {
  const [displayZone, setDisplayZone] = createSignal<WindowSnapZone>('top');

  createEffect(() => {
    const zone = windowStore.state.snapPreview;
    if (zone) {
      setDisplayZone(zone);
    }
  });

  const isVisible = () => windowStore.state.snapPreview !== null;

  return (
    <div
      class="os-window-snap-ghost"
      classList={{
        'is-visible': isVisible(),
        'zone-left': displayZone() === 'left',
        'zone-right': displayZone() === 'right',
        'zone-top': displayZone() === 'top',
      }}
      style={{
        'z-index': windowStore.state.topZIndex,
      }}
      aria-hidden="true"
    >
      <div class="os-window-snap-ghost-badge">
        {SNAP_ZONE_LABELS[displayZone()]}
      </div>
    </div>
  );
};
