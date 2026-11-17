import {
  Component,
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { FERDY_ASSETS } from '@ferdy/assets';
import { appStore } from '../../services/app/fdStore.app';
import {
  desktopStore,
  resolveGridPlacements,
} from '../../services/desktop/fdStore.desktop';
import { windowStore } from '../../services/window/fdStore.window';
import { WindowWrapper } from '../window/fdShell.windowWrapper';
import { DesktopIcon } from './fdShell.desktopIcon';
import './fdShell.desktop.css';

const NEW_WINDOW_ICON_ID = '__new-window__';
const DRAG_THRESHOLD_PX = 6;

interface DragState {
  itemId: string;
  dx: number;
  dy: number;
  targetCol: number;
  targetRow: number;
}

export const Desktop: Component = () => {
  let desktopRef: HTMLElement | undefined;
  let instanceCounter = 3;
  let suppressNextClick = false;

  const [dragState, setDragState] = createSignal<DragState | null>(null);

  const layout = desktopStore.gridLayout;
  const allItemIds = createMemo(() => [
    ...appStore.state.shortcuts.map((s) => s.id),
    NEW_WINDOW_ICON_ID,
  ]);

  const resolvedPlacements = createMemo(() => {
    const current = layout();
    return resolveGridPlacements(
      allItemIds(),
      desktopStore.state.placements,
      current.cols,
      current.rows
    );
  });

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

  const gridStyle = createMemo(() => {
    const current = layout();
    return {
      padding: `${desktopStore.state.padding}px`,
      gap: `${desktopStore.state.gap}px`,
      'grid-template-columns': `repeat(${current.cols}, minmax(0, 1fr))`,
      'grid-template-rows': `repeat(${current.rows}, minmax(0, 1fr))`,
      '--os-cell-size': `${Math.round(current.cellSize)}px`,
    };
  });

  const computeCellFromPointer = (clientX: number, clientY: number) => {
    if (!desktopRef) return { col: 1, row: 1 };
    const rect = desktopRef.getBoundingClientRect();
    const { cols, rows, cellWidth, cellHeight } = layout();
    const { padding, gap } = desktopStore.state;

    const relX = clientX - rect.left - padding;
    const relY = clientY - rect.top - padding;

    const col = Math.min(
      cols,
      Math.max(1, Math.floor(relX / (cellWidth + gap)) + 1)
    );
    const row = Math.min(
      rows,
      Math.max(1, Math.floor(relY / (cellHeight + gap)) + 1)
    );
    return { col, row };
  };

  const startIconDrag = (itemId: string, e: PointerEvent) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!isDragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }

      if (!isDragging) {
        isDragging = true;
        desktopStore.setGhostVisible(true);
      }

      const { col, row } = computeCellFromPointer(
        moveEvent.clientX,
        moveEvent.clientY
      );
      setDragState({
        itemId,
        dx,
        dy,
        targetCol: col,
        targetRow: row,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      const currentDrag = dragState();
      if (isDragging && currentDrag) {
        suppressNextClick = true;
        setTimeout(() => {
          suppressNextClick = false;
        }, 0);
        desktopStore.moveItem(
          itemId,
          currentDrag.targetCol,
          currentDrag.targetRow,
          allItemIds()
        );
      }

      setDragState(null);
      desktopStore.setGhostVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleSpawnNewWindow = () => {
    if (suppressNextClick) return;
    const num = instanceCounter++;
    appStore.launchApp('app-sample', {
      windowId: `sample-app-${num}`,
      title: `Sample App #${num}`,
      queryParams: { instance: num },
    });
  };

  onMount(() => {
    if (!desktopRef) return;

    const updateSize = () => {
      if (!desktopRef) return;
      desktopStore.setViewportSize(desktopRef.clientWidth, desktopRef.clientHeight);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(desktopRef);

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.os-window')) return;

      // 바탕화면 위에서의 Ctrl+Wheel은 브라우저 줌 대신 그리드 배율 조절로 처리
      e.preventDefault();

      if (!desktopStore.state.isDesktopFocused) {
        desktopStore.setDesktopFocused(true);
      }

      if (e.deltaY === 0) return;
      const direction: 1 | -1 = e.deltaY < 0 ? 1 : -1;
      desktopStore.zoomByStep(direction, allItemIds().length);
    };

    desktopRef.addEventListener('wheel', handleWheel, { passive: false });

    onCleanup(() => {
      resizeObserver.disconnect();
      desktopRef?.removeEventListener('wheel', handleWheel);
    });
  });

  return (
    <main
      ref={desktopRef}
      class="os-desktop"
      onPointerDown={(e) => {
        const insideWindow = Boolean((e.target as HTMLElement).closest('.os-window'));
        desktopStore.setDesktopFocused(!insideWindow);
        if (!insideWindow) {
          windowStore.blurAllWindows();
        }
      }}
    >
      {/* Ghost 격자 오버레이 (Ctrl+Wheel 조절 또는 드래그 앤 드롭 시 표시) */}
      <div
        class="os-desktop-ghost-grid"
        classList={{ 'is-visible': desktopStore.state.showGhostGrid }}
        style={gridStyle()}
        aria-hidden="true"
      >
        <For each={ghostCells()}>
          {(cell) => {
            const isDropTarget = () => {
              const current = dragState();
              return (
                current !== null &&
                current.targetCol === cell.col &&
                current.targetRow === cell.row
              );
            };
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

      {/* 바탕화면 바로가기 아이콘 그리드 */}
      <section class="os-desktop-icons" style={gridStyle()}>
        <For each={appStore.state.shortcuts}>
          {(item) => {
            const resolved = () => appStore.resolveShortcut(item);
            const placement = () => resolvedPlacements()[item.id];
            const isDraggingThis = () => dragState()?.itemId === item.id;
            return (
              <Show when={resolved() && placement()}>
                <div
                  class="os-desktop-icon-slot"
                  classList={{ 'is-dragging': isDraggingThis() }}
                  style={{
                    'grid-column': String(placement()!.col),
                    'grid-row': String(placement()!.row),
                    transform: isDraggingThis()
                      ? `translate3d(${dragState()!.dx}px, ${dragState()!.dy}px, 0)`
                      : undefined,
                  }}
                  onPointerDown={(e) => startIconDrag(item.id, e)}
                >
                  <DesktopIcon
                    title={resolved()!.title}
                    icon={resolved()!.icon}
                    tone={resolved()!.tone}
                    iconSize={Math.round(Math.min(46, Math.max(20, layout().cellSize * 0.3)))}
                    isExternal={resolved()!.isExternal || resolved()!.openMode === 'new-tab'}
                    onClick={() => {
                      if (suppressNextClick) return;
                      appStore.openShortcut(item);
                    }}
                  />
                </div>
              </Show>
            );
          }}
        </For>

        <Show when={resolvedPlacements()[NEW_WINDOW_ICON_ID]}>
          {(placement) => {
            const isDraggingThis = () => dragState()?.itemId === NEW_WINDOW_ICON_ID;
            return (
              <div
                class="os-desktop-icon-slot"
                classList={{ 'is-dragging': isDraggingThis() }}
                style={{
                  'grid-column': String(placement().col),
                  'grid-row': String(placement().row),
                  transform: isDraggingThis()
                    ? `translate3d(${dragState()!.dx}px, ${dragState()!.dy}px, 0)`
                    : undefined,
                }}
                onPointerDown={(e) => startIconDrag(NEW_WINDOW_ICON_ID, e)}
              >
                <DesktopIcon
                  title="New Window"
                  icon={FERDY_ASSETS.icons.plus}
                  tone="neutral"
                  iconSize={Math.round(Math.min(40, Math.max(18, layout().cellSize * 0.26)))}
                  onClick={handleSpawnNewWindow}
                />
              </div>
            );
          }}
        </Show>
      </section>

      {/* 활성 창 레이어 (Store의 windows 배열을 Fine-grained 구독) */}
      <section class="os-window-layer">
        <For each={windowStore.state.windows}>
          {(win) => <WindowWrapper window={win} />}
        </For>
      </section>
    </main>
  );
};
