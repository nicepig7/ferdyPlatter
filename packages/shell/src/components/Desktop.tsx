import { Component, For } from 'solid-js';
import { windowStore } from '../store/windowStore';
import { WindowWrapper } from './WindowWrapper';

interface DesktopShortcut {
  id: string;
  title: string;
  icon: string;
  appUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const SHORTCUTS: DesktopShortcut[] = [
  {
    id: 'sample-app-1',
    title: 'Sample App',
    icon: '🧩',
    appUrl: '/apps/app-sample/',
  },
  {
    id: 'clock-app-1',
    title: 'Clock',
    icon: '🕒',
    appUrl: '/apps/app-clock/',
    x: 780,
    y: 80,
    width: 340,
    height: 230,
  },
  {
    id: 'sample-app-2',
    title: 'Second Instance',
    icon: '🚀',
    appUrl: '/apps/app-sample/?instance=2',
  },
];

export const Desktop: Component = () => {
  let instanceCounter = 3;

  const handleOpenShortcut = (shortcut: DesktopShortcut) => {
    windowStore.openWindow({
      id: shortcut.id,
      title: shortcut.title,
      appUrl: shortcut.appUrl,
      x: shortcut.x,
      y: shortcut.y,
      width: shortcut.width,
      height: shortcut.height,
    });
  };

  const handleSpawnNewWindow = () => {
    const num = instanceCounter++;
    windowStore.openWindow({
      id: `sample-app-${num}`,
      title: `Sample App #${num}`,
      appUrl: `/apps/app-sample/?instance=${num}`,
    });
  };

  return (
    <main class="os-desktop">
      {/* 바탕화면 바로가기 아이콘 그리드 */}
      <section class="os-desktop-icons">
        <For each={SHORTCUTS}>
          {(item) => (
            <button
              type="button"
              class="os-desktop-icon"
              onDblClick={() => handleOpenShortcut(item)}
              onClick={() => handleOpenShortcut(item)}
            >
              <span class="os-desktop-icon-glyph">{item.icon}</span>
              <span class="os-desktop-icon-label">{item.title}</span>
            </button>
          )}
        </For>

        <button
          type="button"
          class="os-desktop-icon"
          onClick={handleSpawnNewWindow}
        >
          <span class="os-desktop-icon-glyph">➕</span>
          <span class="os-desktop-icon-label">New Window</span>
        </button>
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

