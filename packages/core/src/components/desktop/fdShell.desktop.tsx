import { Component, For, Show, createMemo } from 'solid-js';
import { appStore } from '../../services/app/fdCore.app.store';
import {
  desktopStore,
  resolveGridPlacements,
} from '../../services/desktop/fdCore.desktop.store';
import { windowStore } from '../../services/window/fdCore.window.store';
import { WindowWrapper } from '../window/fdShell.window';
import { WindowSnapGhost } from '../window/components/fdShell.window.ghost';
import { DesktopGhost } from './components/fdShell.desktop.ghost';
import {
  useDesktopIconDrag,
  useDesktopViewport,
} from './hooks/fdShell.desktop.hooks';
import { DesktopIcon } from './components/fdShell.desktop.icon';
import './fdShell.desktop.css';

const NEW_WINDOW_ICON_ID = '__new-window__';

export const Desktop: Component = () => {
  let desktopRef: HTMLElement | undefined;
  let instanceCounter = 3;

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

  const { dragState, startIconDrag, shouldSuppressClick } = useDesktopIconDrag(
    () => desktopRef,
    allItemIds
  );

  useDesktopViewport(
    () => desktopRef,
    () => allItemIds().length
  );

  const handleSpawnNewWindow = () => {
    if (shouldSuppressClick()) return;
    while (windowStore.state.windows.some((w) => w.id === `sample-app-${instanceCounter}`)) {
      instanceCounter += 1;
    }
    const num = instanceCounter++;
    appStore.launchApp('sample-app', {
      windowId: `sample-app-${num}`,
      title: `Sample App #${num}`,
      queryParams: { instance: num },
    });
  };

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
      <DesktopGhost gridStyle={gridStyle()} dragState={dragState()} />

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
                      if (shouldSuppressClick()) return;
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
                  icon="plus"
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
        <WindowSnapGhost />
        <For each={windowStore.state.windows}>
          {(win) => <WindowWrapper window={win} />}
        </For>
      </section>
    </main>
  );
};
