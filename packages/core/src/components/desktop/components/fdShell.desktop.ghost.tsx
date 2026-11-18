import { Component, For, JSX, createMemo } from 'solid-js';
import { desktopStore } from '../../../services/desktop/fdCore.desktop.store';
import type { DragState } from '../hooks/fdShell.desktop.hooks';

export interface DesktopGhostProps {
  gridStyle: JSX.CSSProperties;
  dragState: DragState | null;
}

export const DesktopGhost: Component<DesktopGhostProps> = (props) => {
  const layout = desktopStore.gridLayout;

  const ghostCells = createMemo(() => {
    const { cols, rows } = layout();
    const cells: Array<{ col: number; row: number }> = [];
    for (let col = 1; col <= cols; col += 1) {
      for (let row = 1; row <= rows; row += 1) {
        cells.push({ col, row });
      }
    }
    return cells;
  });

  return (
    <>
      {/* Ghost 격자 오버레이 (Ctrl+Wheel 조절 또는 드래그 앤 드롭 시 표시) */}
      <div
        class="os-desktop-ghost-grid"
        classList={{ 'is-visible': desktopStore.state.showGhostGrid }}
        style={props.gridStyle}
        aria-hidden="true"
      >
        <For each={ghostCells()}>
          {(cell) => {
            const isDropTarget = () =>
              props.dragState !== null &&
              props.dragState.targetCol === cell.col &&
              props.dragState.targetRow === cell.row;

            return (
              <div
                class="os-desktop-ghost-cell"
                classList={{ 'is-drop-target': isDropTarget() }}
              />
            );
          }}
        </For>
      </div>

      {/* 그리드 배율 인디케이터 */}
      <div
        class="os-desktop-grid-badge"
        classList={{ 'is-visible': desktopStore.state.showGhostGrid }}
        aria-hidden="true"
      >
        Grid {layout().cols}×{layout().rows} · {Math.round(layout().cellSize)}px
      </div>
    </>
  );
};
